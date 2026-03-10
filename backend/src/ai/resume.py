from langchain_groq import ChatGroq
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate
from src.ai.embeddings import load_and_split_file
from src.utils.settings import settings
import json

llm = ChatGroq(
    # model="llama-3.3-70b-versatile",
    model="llama-3.1-8b-instant",
    api_key=settings.GROQ_API_KEY
)

SUGGESTION_PROMPT = PromptTemplate(
    input_variables=["resume"],
    template="""
You are an expert career coach. Analyze the resume below and provide actionable suggestions 
to improve it. Focus on structure, clarity, missing sections, skills gaps, and overall impact.

Resume:
{resume}

Respond ONLY with a valid JSON array of suggestion strings. No preamble, no markdown.
Example: ["Add quantified achievements", "Include a summary section", ...]

Provide at least 5 and at most 10 suggestions.
"""
)

QUESTIONS_PROMPT = PromptTemplate(
    input_variables=["resume"],
    template="""
You are a senior technical interviewer. Based on the resume below, generate exactly 10 
important interview questions a recruiter or hiring manager is likely to ask, along with 
ideal answers tailored to the candidate's background.

Resume:
{resume}

Respond ONLY with a valid JSON array of objects. No preamble, no markdown.
Each object must have exactly two keys: "question" and "answer".
Example:
[
  {{"question": "Tell me about yourself.", "answer": "..."}},
  ...
]
"""
)


def extract_resume_text(file_bytes: bytes, filename: str, content_type: str) -> str:
    chunks = load_and_split_file(file_bytes, filename, content_type)
    return "\n\n".join([chunk.page_content for chunk in chunks])


def get_suggestions(resume_text: str) -> list[str]:
    chain = SUGGESTION_PROMPT | llm | StrOutputParser()
    raw = chain.invoke({"resume": resume_text})
    try:
        cleaned = raw.strip().removeprefix("```json").removesuffix("```").strip()
        suggestions = json.loads(cleaned)
        return suggestions if isinstance(suggestions, list) else []
    except json.JSONDecodeError:
        return []


def get_interview_questions(resume_text: str) -> list[dict]:
    chain = QUESTIONS_PROMPT | llm | StrOutputParser()
    raw = chain.invoke({"resume": resume_text})
    try:
        cleaned = raw.strip().removeprefix("```json").removesuffix("```").strip()
        questions = json.loads(cleaned)
        return questions if isinstance(questions, list) else []
    except json.JSONDecodeError:
        return []


def analyze_resume(file_bytes: bytes, filename: str, content_type: str) -> dict:
    resume_text = extract_resume_text(file_bytes, filename, content_type)
    suggestions = get_suggestions(resume_text)
    questions = get_interview_questions(resume_text)
    return {
        "suggestions": suggestions,
        "questions": questions
    }