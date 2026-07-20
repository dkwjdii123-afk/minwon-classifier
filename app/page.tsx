"use client";

import { useState } from "react";

type ClassificationResult = {
  label: number;
  category: string;
  reason: string;
};

const sampleComplaints = [
  "산사태 위험이 있으니 안전점검을 요청합니다.",
  "하천에서 이상한 냄새가 나고 수질이 오염된 것 같습니다.",
  "교차로 신호등이 고장 나서 교통체증이 심합니다.",
];

export default function Home() {
  const [complaint, setComplaint] = useState("");
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function classifyComplaint() {
    if (!complaint.trim()) {
      setError("민원 내용을 입력해 주세요.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/classify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          complaintText: complaint.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "민원 분류 중 오류가 발생했습니다.");
      }

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <section className="rounded-2xl bg-white p-8 shadow-lg">
          <header className="mb-8 text-center">
            <p className="mb-2 text-sm font-semibold text-blue-700">
              LLM 기반 민원 분류 서비스
            </p>

            <h1 className="text-3xl font-bold text-slate-900">
              민원 자동분류 시스템
            </h1>

            <p className="mt-3 text-slate-600">
              민원 내용을 입력하면 담당 분야와 라벨 번호를 자동으로
              분류합니다.
            </p>
          </header>

          <label
            htmlFor="complaint"
            className="mb-2 block font-semibold text-slate-800"
          >
            민원 내용
          </label>

          <textarea
            id="complaint"
            value={complaint}
            onChange={(event) => setComplaint(event.target.value)}
            placeholder="민원 내용을 입력해 주세요."
            className="h-40 w-full resize-none rounded-xl border border-slate-300 p-4 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />

          <div className="mt-3 flex flex-wrap gap-2">
            {sampleComplaints.map((sample, index) => (
              <button
                key={sample}
                type="button"
                onClick={() => {
                  setComplaint(sample);
                  setError("");
                  setResult(null);
                }}
                className="rounded-full bg-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-300"
              >
                예시 {index + 1}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={classifyComplaint}
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? "분류 중..." : "민원 자동분류"}
          </button>

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          {result && (
            <section className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-6">
              <p className="text-sm font-semibold text-blue-700">분류 결과</p>

              <div className="mt-3 flex items-center gap-3">
                <span className="rounded-lg bg-blue-700 px-3 py-2 text-lg font-bold text-white">
                  {result.label}
                </span>

                <h2 className="text-2xl font-bold text-slate-900">
                  {result.category}
                </h2>
              </div>

              <p className="mt-4 leading-7 text-slate-700">{result.reason}</p>
            </section>
          )}

          <div className="mt-8 grid grid-cols-2 gap-2 text-center text-sm sm:grid-cols-4">
            {[
              "0 민원행정",
              "1 복지돌봄",
              "2 안전재난",
              "3 교통도로",
              "4 환경위생",
              "5 건축주택",
              "6 교육문화",
              "7 경제산업",
            ].map((category) => (
              <div
                key={category}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-slate-600"
              >
                {category}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}