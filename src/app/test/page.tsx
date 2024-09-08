"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

export default function TestPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [status, setStatus] = useState("");

  const handleSearch = async () => {
    setResults([]);
    setStatus("Searching...");

    const eventSource = new EventSource(
      `/api/search-engine/structured-search?query=${encodeURIComponent(query)}`
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setResults((prevResults) => [...prevResults, data]);
    };

    eventSource.addEventListener("newsStart", () =>
      setStatus("Starting news search")
    );
    eventSource.addEventListener("adStart", () =>
      setStatus("Starting ad search")
    );
    eventSource.addEventListener("newsSkipped", () =>
      setStatus("News search skipped")
    );
    eventSource.addEventListener("adSkipped", () =>
      setStatus("Ad search skipped")
    );

    eventSource.addEventListener("newsResults", (event) => {
      const data = JSON.parse(event.data);
      setResults((prevResults: any[]) => [
        ...prevResults,
        { type: "news", data: data.data },
      ]);
    });

    eventSource.addEventListener("adResults", (event) => {
      const data = JSON.parse(event.data);
      setResults((prevResults: any[]) => [
        ...prevResults,
        { type: "ads", data: data.data },
      ]);
    });
    eventSource.addEventListener("error", (event: Event) => {
      if (event instanceof MessageEvent) {
        const data = JSON.parse(event.data);
        setStatus(`Error: ${data.error}`);
      } else {
        setStatus("An error occurred");
      }
      eventSource.close();
    });

    eventSource.addEventListener("done", () => {
      setStatus("Search completed");
      eventSource.close();
    });
  };

  return (
    <div>
      <Input
        placeholder="Enter query"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <Button onClick={handleSearch}>Search</Button>
      <div>Status: {status}</div>
      <div>
        {results.map((result, index) => (
          <div key={index}>
            <h3>{result.type === "news" ? "News Result" : "Ad Result"}</h3>
            <pre className="text-[6px]">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
