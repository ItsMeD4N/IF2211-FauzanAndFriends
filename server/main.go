package main

import (
	"log"
	"net/http"
	"os"
)

func main() {
	port := os.Getenv("APP_PORT")
	if port == "" {
		port = "8080"
	}

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		path := "./client" + r.URL.Path

		if _, err := os.Stat(path); os.IsNotExist(err) {
			http.ServeFile(w, r, "./client/index.html")
			return
		}

		http.FileServer(http.Dir("./client")).ServeHTTP(w, r)
	})

	log.Fatal(http.ListenAndServe(":"+port, nil))
}