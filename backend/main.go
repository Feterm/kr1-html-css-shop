package main

import (
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"io"
	"log"
	"math"
	"net/http"
	"os"
	"strings"
	"time"
)

type Product struct {
	Name            string  `json:"name"`
	Price           float64 `json:"price"`
	DiscountPercent float64 `json:"discountPercent"`
	Stock           int     `json:"stock"`
	IsAvailable     bool    `json:"isAvailable"`
}

type Calculation struct {
	FormattedPrice string  `json:"formattedPrice"`
	Discount       float64 `json:"discount"`
	FinalPrice     float64 `json:"finalPrice"`
	Status         string  `json:"status"`
	Summary        string  `json:"summary"`
}

func calculateDiscount(price, discountPercent float64) float64 {
	return math.Round(price*discountPercent) / 100
}

func calculateFinalPrice(price, discountPercent float64) float64 {
	return math.Round((price-calculateDiscount(price, discountPercent))*100) / 100
}

func formatPrice(price float64) string {
	cents := int64(math.Round(price * 100))
	whole := fmt.Sprintf("%d", cents/100)
	for i := len(whole) - 3; i > 0; i -= 3 {
		whole = whole[:i] + "\u00a0" + whole[i:]
	}
	if cents%100 != 0 {
		return fmt.Sprintf("%s,%02d\u00a0₽", whole, cents%100)
	}
	return whole + "\u00a0₽"
}

func getProductStatus(product Product) string {
	if product.IsAvailable && product.Stock > 0 {
		return "В наличии"
	}
	return "Нет в наличии"
}

func createProductSummary(product Product) Calculation {
	finalPrice := calculateFinalPrice(product.Price, product.DiscountPercent)
	status := getProductStatus(product)
	formatted := formatPrice(finalPrice)
	return Calculation{
		FormattedPrice: formatted,
		Discount:       calculateDiscount(product.Price, product.DiscountPercent),
		FinalPrice:     finalPrice,
		Status:         status,
		Summary:        fmt.Sprintf("%s: %s. Статус: %s.", product.Name, formatted, status),
	}
}

func validProduct(product Product) bool {
	return len(product.Name) > 0 && len(product.Name) <= 500 &&
		!math.IsNaN(product.Price) && !math.IsInf(product.Price, 0) &&
		product.Price >= 0 && product.Price <= 1_000_000_000 &&
		!math.IsNaN(product.DiscountPercent) && !math.IsInf(product.DiscountPercent, 0) &&
		product.DiscountPercent >= 0 && product.DiscountPercent <= 100 &&
		product.Stock >= 0 && product.Stock <= 1_000_000
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(value); err != nil {
		log.Printf("write response: %v", err)
	}
}

func calculate(w http.ResponseWriter, r *http.Request) {
	if strings.Split(r.Header.Get("Content-Type"), ";")[0] != "application/json" {
		writeJSON(w, http.StatusUnsupportedMediaType, map[string]string{"error": "Expected application/json"})
		return
	}
	r.Body = http.MaxBytesReader(w, r.Body, 4096)
	defer r.Body.Close()
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	var product Product
	if err := decoder.Decode(&product); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid product JSON"})
		return
	}
	var extra any
	if err := decoder.Decode(&extra); !errors.Is(err, io.EOF) {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Expected one JSON object"})
		return
	}
	product.Name = strings.TrimSpace(product.Name)
	if !validProduct(product) {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid name, price, discount or stock"})
		return
	}
	writeJSON(w, http.StatusOK, createProductSummary(product))
}

func handler(staticDir string) http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/health", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})
	mux.HandleFunc("POST /api/calculate", calculate)
	// Unknown API paths must not return a page with a successful status.
	mux.HandleFunc("/api/", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "Endpoint not found"})
	})
	mux.Handle("/", http.FileServer(http.Dir(staticDir)))
	return mux
}

func main() {
	addr := flag.String("addr", "127.0.0.1:8080", "HTTP listen address")
	staticDir := flag.String("static", "../dist", "Built React site directory")
	flag.Parse()
	if _, err := os.Stat(*staticDir + "/index.html"); err != nil {
		log.Fatal("Build the frontend before starting: ", err)
	}
	server := &http.Server{
		Addr: *addr, Handler: handler(*staticDir),
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       10 * time.Second,
		WriteTimeout:      15 * time.Second,
		IdleTimeout:       60 * time.Second,
	}
	log.Printf("СтройБаза: http://%s", *addr)
	log.Fatal(server.ListenAndServe())
}
