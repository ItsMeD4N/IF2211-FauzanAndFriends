package main

import (
	"log"
	"net/http"
	"os"
	"stima-tubes2/handler"
)

func corsMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Max-Age", "86400")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next(w, r)
	}
}

func main() {
	port := os.Getenv("APP_PORT")
	if port == "" {
		port = "8080"
	}

	http.HandleFunc("/api/parse", corsMiddleware(handler.HandleParse))
	http.HandleFunc("/api/search", corsMiddleware(handler.HandleSearch))
	http.HandleFunc("/api/lca", corsMiddleware(handler.HandleLCA))

	http.HandleFunc("/api/health", corsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok"}`))
	}))

	fs := http.FileServer(http.Dir("./client"))
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		path := "./client" + r.URL.Path
		if _, err := os.Stat(path); os.IsNotExist(err) {
			http.ServeFile(w, r, "./client/index.html")
			return
		}
		fs.ServeHTTP(w, r)
	})

	log.Printf("Server starting on http://localhost:%s", port)
	log.Printf("API endpoints: /api/parse, /api/search, /api/lca")
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
