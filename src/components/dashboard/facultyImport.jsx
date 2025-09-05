"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function FacultyImport() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult("");
    setError("");
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setIsUploading(true);
    setError("");
    setResult("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/faculty/import", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data.message);
        if (data.errors) {
          setError("Some rows had errors: " + data.errors.join(", "));
        }
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Faculty Data</CardTitle>
        <CardDescription>
          Upload a CSV file with faculty information (Admin only)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="csv-file">Select CSV File</Label>
          <Input
            id="csv-file"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          <p className="text-sm text-muted-foreground mt-1">
            CSV format: facultyName, email, imgURL (optional)
          </p>
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        {result && <div className="text-green-500 text-sm">{result}</div>}

        <Button onClick={handleUpload} disabled={!file || isUploading}>
          {isUploading ? "Importing..." : "Import CSV"}
        </Button>
      </CardContent>
    </Card>
  );
}
