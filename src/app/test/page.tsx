"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { StreamedSearchResult } from "@/lib/types/lightspeed-search";
import { v4 as uuidv4 } from "uuid";

export default function TestPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StreamedSearchResult>({});
  const [status, setStatus] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);

  const handleSearch = async () => {
    setResults({});
    setStatus("Searching...");

    const eventSource = new EventSource(
      `/api/search-engine/structured-search?query=${encodeURIComponent(
        query
      )}&openai_client_history_id=${sessionId}`
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setResults((prevResults) => ({ ...prevResults, ...data }));
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

    eventSource.addEventListener("tiktokStart", () =>
      setStatus("Starting TikTok search")
    );
    eventSource.addEventListener("tiktokSkipped", () =>
      setStatus("TikTok search skipped")
    );

    eventSource.addEventListener("newsResults", (event) => {
      const data = JSON.parse(event.data);
      setResults((prevResults) => ({ ...prevResults, news: data.data }));
    });

    eventSource.addEventListener("adResults", (event) => {
      const data = JSON.parse(event.data);
      setResults((prevResults) => ({ ...prevResults, ads: data.data }));
    });

    eventSource.addEventListener("tiktokResults", (event) => {
      const data = JSON.parse(event.data);
      setResults((prevResults) => ({ ...prevResults, tiktoks: data.data }));
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

    eventSource.addEventListener("summary", (event) => {
      const data = JSON.parse(event.data);
      setResults((prevResults) => ({
        ...prevResults,
        summary: prevResults.summary
          ? prevResults.summary + data.message
          : data.message,
      }));
    });

    eventSource.addEventListener("done", () => {
      setStatus("Search completed");
      eventSource.close();
    });
  };

  const handleClear = () => {
    setResults({});
    setStatus("");
    setSessionId(uuidv4());
  };
  useEffect(() => {
    setSessionId(uuidv4());
  }, []);

  return (
    <div>
      <Input
        placeholder="Enter query"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="flex flex-row gap-2">
        <Button onClick={handleSearch}>Search</Button>
        <Button onClick={handleClear}>Reset session</Button>
      </div>
      <div>Status: {status}</div>
      <div>
        {results.summary && (
          <>
            <h3 className="text-lg font-bold">Summary</h3>
            <p>{results.summary}</p>
          </>
        )}
        {results.tiktoks && (
          <>
            <h3 className="text-lg font-bold">
              TikTok Result <span>({results.tiktoks.length})</span>
            </h3>
            <pre className="text-xs">
              {JSON.stringify(results.tiktoks, null, 2)}
            </pre>
          </>
        )}
        {results.ads && (
          <>
            <h3 className="text-lg font-bold">
              Ad Result <span>({results.ads.length})</span>
            </h3>
            <pre className="text-xs">
              {JSON.stringify(results.ads, null, 2)}
            </pre>
          </>
        )}
        {results.news && (
          <>
            <h3 className="text-lg font-bold">
              News Result <span>({results.news.length})</span>
            </h3>
            <pre className="text-xs">
              {JSON.stringify(results.news, null, 2)}
            </pre>
          </>
        )}
      </div>
    </div>
  );
}
