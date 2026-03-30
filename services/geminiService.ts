import { GoogleGenAI } from "@google/genai";

// Helper to get client with current environment key
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please select a key.");
  }
  return new GoogleGenAI({ apiKey });
};

// Centralized error handler to catch various API key error formats
const handleGeminiError = (error: any) => {
  console.error("Gemini Operation Failed:", error);
  
  // Combine all possible error representations into one string for checking
  const errorString = JSON.stringify(error) + (error.message || "") + (error.toString() || "");
  const lowerError = errorString.toLowerCase();

  // Check for specific keywords indicating auth/key issues
  if (
    lowerError.includes("api key") || 
    lowerError.includes("expired") || 
    lowerError.includes("invalid_argument") || 
    lowerError.includes("permission_denied") || 
    lowerError.includes("unauthenticated") ||
    lowerError.includes("403") // Forbidden often means quota or key issue
  ) {
    throw new Error("API Key expired or invalid. Please select a new key.");
  }

  // Check if it was a model refusal passed down
  if (error.message && (error.message.includes("Model refused") || error.message.includes("Model returned text"))) {
    throw error;
  }

  // Fallback to generic error
  throw new Error(error.message || "An unexpected error occurred with the AI service.");
};

export const generatePostContent = async (
  courseName: string,
  courseDescription: string,
  platform: string,
  tone: string,
  template?: string
): Promise<string> => {
  try {
    const ai = getClient();
    
    const prompt = `
      You are a professional social media manager for a training provider platform.
      
      Task: Write a social media post for ${platform}.
      
      Context:
      - Course Title: "${courseName}"
      - Course Description: "${courseDescription}"
      - Tone: ${tone}
      - Template Style: ${template || 'Standard Promotion'}
      
      Requirements:
      - Optimized for ${platform} (length, formatting).
      - Include 3-5 relevant hashtags.
      - Specific call to action to Enroll Now.
      - Do not include placeholders like "[Link]".
      - Return ONLY the post text.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Failed to generate content.";
  } catch (error: any) {
    handleGeminiError(error);
    return ""; // Unreachable
  }
};

export const refinePostContent = async (
  originalText: string,
  instruction: string
): Promise<string> => {
  try {
    const ai = getClient();
    const prompt = `
      You are a professional editor.
      Original Text: "${originalText}"
      Instruction: ${instruction}

      Requirements:
      - Maintain the original meaning.
      - Return ONLY the updated text. 
      - Do not add conversational filler ("Here is the updated text").
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || originalText;
  } catch (error: any) {
    handleGeminiError(error);
    return ""; // Unreachable
  }
};

export const generateImage = async (
  prompt: string,
  size: "1K" | "2K" | "4K"
): Promise<string> => {
  try {
    const ai = getClient();

    const isHighQuality = size === '2K' || size === '4K';
    const model = isHighQuality ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
    
    const config: any = {
      imageConfig: {
        numberOfImages: 1,
        aspectRatio: "1:1"
      }
    };

    if (isHighQuality) {
      config.imageConfig.imageSize = size;
    }

    // Explicitly instruct the model to generate an image to avoid text-only responses for abstract prompts
    const imagePrompt = `Generate a high-quality image representing: ${prompt}`;

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [{ text: imagePrompt }],
      },
      config: config,
    });

    const candidate = response.candidates?.[0];
    let refusalText = "";

    for (const part of candidate?.content?.parts || []) {
      if (part.inlineData) {
        const mimeType = part.inlineData.mimeType || 'image/png';
        return `data:${mimeType};base64,${part.inlineData.data}`;
      }
      if (part.text) {
        refusalText += part.text;
      }
    }
    
    if (candidate?.finishReason === 'SAFETY') {
      throw new Error("Image generation blocked by safety filters. Please try a different prompt.");
    }

    if (refusalText) {
       // If the model returned text instead of an image, it likely refused the prompt or misunderstood
       // Clean up the error message for the UI
       const cleanRefusal = refusalText.length > 100 ? refusalText.substring(0, 100) + "..." : refusalText;
       throw new Error(`Model returned text instead of image: "${cleanRefusal}". Try a more specific visual description.`);
    }

    throw new Error("No image data returned from API. The model may have failed to process the prompt.");
  } catch (error: any) {
    handleGeminiError(error);
    return ""; // Unreachable
  }
};

export const generateVideo = async (
  prompt: string,
  aspectRatio: "16:9" | "9:16"
): Promise<string> => {
  try {
    const ai = getClient();

    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video generation failed");

    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await videoResponse.blob();
    return URL.createObjectURL(blob);
  } catch (error: any) {
    handleGeminiError(error);
    return ""; // Unreachable
  }
};

export const analyzeWebsiteBranding = async (url: string): Promise<{
  primaryColor: string;
  secondaryColor: string;
  logoDescription: string;
}> => {
  try {
    const ai = getClient();
    const prompt = `
      Analyze the website at ${url}.
      Extract the primary and secondary brand colors (in Hex format).
      Also, provide a brief description of their logo (e.g., "A blue stylized 'G' with a minimalist feel").
      
      Return the result in JSON format:
      {
        "primaryColor": "#HEX",
        "secondaryColor": "#HEX",
        "logoDescription": "description"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ urlContext: {} }],
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error: any) {
    handleGeminiError(error);
    return { primaryColor: "#000000", secondaryColor: "#FFFFFF", logoDescription: "" };
  }
};

export const analyzeCourseUrl = async (url: string): Promise<{
  title: string;
  category: string;
  description: string;
  learningObjectives: string[];
  targetAudience: string;
}> => {
  try {
    const ai = getClient();
    const prompt = `
      Analyze the course page at ${url}.
      Extract the following information:
      - Course Title
      - Category (e.g., Programming, Marketing, Business, etc.)
      - A concise 2-3 sentence description
      - 3-5 key learning objectives
      - Target audience (who is this course for?)

      Return the result in JSON format:
      {
        "title": "Course Title",
        "category": "Category",
        "description": "Description",
        "learningObjectives": ["Objective 1", "Objective 2"],
        "targetAudience": "Target Audience"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ urlContext: {} }],
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error: any) {
    handleGeminiError(error);
    throw error;
  }
};
