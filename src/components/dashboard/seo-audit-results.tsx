"use client";

import Link from "next/link";
import { useState } from "react";

type AuditResult = {
  id: string;
  type: "product" | "page";
  title: string;
  slug: string;
  score: number;
  issues: string[];
  warnings: string[];
  successes: string[];
};

type SEOAuditResultsProps = {
  results: AuditResult[];
};

export function SEOAuditResults({ results }: SEOAuditResultsProps) {
  const [filter, setFilter] = useState<"all" | "critical" | "warning" | "good">(
    "all"
  );

  const filteredResults = results.filter((result) => {
    if (filter === "critical") return result.issues.length > 0;
    if (filter === "warning")
      return result.warnings.length > 0 && result.issues.length === 0;
    if (filter === "good")
      return result.issues.length === 0 && result.warnings.length === 0;
    return true;
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Good";
    if (score >= 60) return "Needs Work";
    return "Critical";
  };

  const criticalCount = results.filter((r) => r.issues.length > 0).length;
  const warningCount = results.filter(
    (r) => r.warnings.length > 0 && r.issues.length === 0
  ).length;
  const goodCount = results.filter(
    (r) => r.issues.length === 0 && r.warnings.length === 0
  ).length;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Pages
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {results.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Critical Issues
                  </dt>
                  <dd className="text-3xl font-semibold text-red-600">
                    {criticalCount}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-yellow-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Warnings
                  </dt>
                  <dd className="text-3xl font-semibold text-yellow-600">
                    {warningCount}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Good
                  </dt>
                  <dd className="text-3xl font-semibold text-green-600">
                    {goodCount}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            filter === "all"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          All ({results.length})
        </button>
        <button
          onClick={() => setFilter("critical")}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            filter === "critical"
              ? "bg-red-600 text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          Critical ({criticalCount})
        </button>
        <button
          onClick={() => setFilter("warning")}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            filter === "warning"
              ? "bg-yellow-600 text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          Warnings ({warningCount})
        </button>
        <button
          onClick={() => setFilter("good")}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            filter === "good"
              ? "bg-green-600 text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          Good ({goodCount})
        </button>
      </div>

      {/* Results List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredResults.length === 0 ? (
            <li className="px-6 py-12 text-center text-sm text-gray-500">
              No results found for this filter.
            </li>
          ) : (
            filteredResults.map((result) => (
              <li key={result.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {result.title}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreColor(
                          result.score
                        )}`}
                      >
                        {result.score}% - {getScoreLabel(result.score)}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {result.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">/{result.slug}</p>

                    {/* Issues */}
                    {result.issues.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs font-medium text-red-600 mb-1">
                          Critical Issues:
                        </p>
                        <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                          {result.issues.map((issue, i) => (
                            <li key={i}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Warnings */}
                    {result.warnings.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs font-medium text-yellow-600 mb-1">
                          Warnings:
                        </p>
                        <ul className="list-disc list-inside text-sm text-yellow-600 space-y-1">
                          {result.warnings.map((warning, i) => (
                            <li key={i}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Successes */}
                    {result.successes.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-green-600 mb-1">
                          Optimized:
                        </p>
                        <ul className="list-disc list-inside text-sm text-green-600 space-y-1">
                          {result.successes.map((success, i) => (
                            <li key={i}>{success}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="ml-6 flex items-center gap-2">
                    <Link
                      href={`/dashboard/${
                        result.type === "product" ? "products" : "pages"
                      }/${result.id}`}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Fix Issues
                    </Link>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
