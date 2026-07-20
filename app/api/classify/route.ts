import OpenAI from "openai";
import { NextResponse } from "next/server";

const categories = [
  "민원행정",
  "복지돌봄",
  "안전재난",
  "교통도로",
  "환경위생",
  "건축주택",
  "교육문화",
  "경제산업",
] as const;

const jsonSchema = {
  type: "object",
  properties: {
    label: {
      type: "integer",
      minimum: 0,
      maximum: 7,
    },
    category: {
      type: "string",
      enum: categories,
    },
    reason: {
      type: "string",
    },
  },
  required: ["label", "category", "reason"],
  additionalProperties: false,
} as const;

export async function POST(request: Request) {
  try {
    const { complaintText } = await request.json();

    if (!complaintText?.trim()) {
      return NextResponse.json(
        { error: "민원 내용을 입력해 주세요." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey,
    });

    const prompt = `
당신은 공공기관 민원 분류 담당자입니다.

다음 민원을 아래 8개 카테고리 중 하나로 분류하세요.

0 민원행정
1 복지돌봄
2 안전재난
3 교통도로
4 환경위생
5 건축주택
6 교육문화
7 경제산업

민원 내용:
${complaintText}
`;

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
      text: {
        format: {
          type: "json_schema",
          name: "complaint_classification",
          strict: true,
          schema: jsonSchema,
        },
      },
      max_output_tokens: 200,
    });

    const result = JSON.parse(response.output_text);

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "민원 분류 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}