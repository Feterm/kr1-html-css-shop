package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestCalculation(t *testing.T) {
	for _, tc := range []struct {
		price, discount, want float64
	}{
		{100, 0, 100}, {100, 100, 0}, {7990, (7990.0 - 6490) / 7990 * 100, 6490},
		{0.05, 10, 0.04},
	} {
		got := calculateFinalPrice(tc.price, tc.discount)
		if got != tc.want {
			t.Errorf("price %v discount %v: got %v want %v", tc.price, tc.discount, got, tc.want)
		}
	}
}

func TestAPI(t *testing.T) {
	for _, tc := range []struct {
		body string
		want int
	}{
		{`{"name":"Дрель","price":100,"discountPercent":10,"stock":3,"isAvailable":true}`, 200},
		{`{"name":"Товар","price":100,"discountPercent":101,"stock":3,"isAvailable":true}`, 400},
		{`{"name":"Товар","price":-1,"stock":3}`, 400},
		{`{"name":"Товар","price":10,"stock":-1}`, 400},
		{`{"name":"Товар","price":10,"extra":true}`, 400},
		{`{"name":"Товар","price":10} {}`, 400},
		{`{"name":"","price":10}`, 400},
		{strings.Repeat("x", 5000), 400},
	} {
		request := httptest.NewRequest(http.MethodPost, "/api/calculate", strings.NewReader(tc.body))
		request.Header.Set("Content-Type", "application/json")
		response := httptest.NewRecorder()
		handler(t.TempDir()).ServeHTTP(response, request)
		if response.Code != tc.want {
			t.Errorf("%s: got %d want %d", tc.body[:min(80, len(tc.body))], response.Code, tc.want)
		}
		if tc.want == 200 {
			var result Calculation
			if err := json.Unmarshal(response.Body.Bytes(), &result); err != nil {
				t.Fatal(err)
			}
			if result.FinalPrice != 90 || result.Status != "В наличии" {
				t.Fatalf("Unexpected result: %+v", result)
			}
		}
	}
}

func TestProductStatus(t *testing.T) {
	if getProductStatus(Product{Stock: 0, IsAvailable: true}) != "Нет в наличии" {
		t.Fatal("Zero stock must be unavailable")
	}
	if getProductStatus(Product{Stock: 3, IsAvailable: false}) != "Нет в наличии" {
		t.Fatal("Disabled product must be unavailable")
	}
}
