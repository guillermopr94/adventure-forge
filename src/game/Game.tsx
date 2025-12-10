import React, { useRef, useEffect, useState } from "react";
import { useLanguage, useTranslation } from "../language/LanguageContext";
import "./Game.css";
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import TextNarrator from "../textNarrator/TextNarrator";
import { FiRotateCw } from 'react-icons/fi';
import BackgroundMusic from "../backgroundMusic/BackgroundMusic";
import { GoogleGenAI } from "@google/genai";
import Typewriter from "./Typewriter";

interface GameProps {
  userToken: string;
  gameType: string;
  genreKey: string;
}

const Game: React.FC<GameProps> = ({ userToken, gameType, genreKey }): React.ReactElement => {

  const option1 = useRef<HTMLButtonElement>(null);
  const option2 = useRef<HTMLButtonElement>(null);
  const option3 = useRef<HTMLButtonElement>(null);
  const spinner = useRef<HTMLDivElement>(null);
  const options = useRef<HTMLDivElement>(null);
  const gameCarousel = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [voicesLoaded, setVoicesLoaded] = useState(false);

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [gameContent, setGameContent] = useState<string[]>([]);
  const [actualContent, setActualContent] = useState<string | null>(null);
  const [audioData, setAudioData] = useState<string | undefined>(undefined);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [currentAudioDuration, setCurrentAudioDuration] = useState<number>(0);

  // Dynamic music selection based on genre
  const getMusicFile = (genre: string) => {
    switch (genre) {
      case 'scifi': return process.env.PUBLIC_URL + '/music/scifi.m4a';
      case 'horror': return process.env.PUBLIC_URL + '/music/horror.m4a';
      case 'superheroes': return process.env.PUBLIC_URL + '/music/superheroes.m4a';
      case 'romance': return process.env.PUBLIC_URL + '/music/romance.m4a';
      case 'fantasy':
      default: return process.env.PUBLIC_URL + '/music/fantasy.m4a';
    }
  };

  const audioFile = getMusicFile(genreKey);

  const updateVoices = () => {
    const availableVoices = window.speechSynthesis.getVoices();
    setVoices(availableVoices);
    if (availableVoices.length > 0) {
      setVoicesLoaded(true);
    }
  };

  useEffect(() => {
    window.speechSynthesis.addEventListener("voiceschanged", updateVoices);
    updateVoices();

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", updateVoices);
    };
  }, []);

  const selectedVoice = voices.find((voice) => voice.lang.startsWith(language));

  const [gameHistory, setGameHistory] = useState<any[]>([
    {
      role: "user", // Gemini uses 'user' and 'model' roles, but for history context we can adapt
      parts: [{ text: t("game_history_content", { gameType: gameType }) }],
    },
  ]);

  function toggleSpinner(visible: boolean) {
    if (spinner.current && gameCarousel.current) {
      spinner.current.classList.toggle("hidden", !visible);
      gameCarousel.current.classList.toggle("hidden", visible);
    }
  }

  function toggleOptions(visible: boolean) {
    if (options.current) {
      options.current.classList.toggle("hidden", !visible);
    } else {
      console.error("No se encontró el elemento 'options'.");
    }
  }

  function extractOptions(text: string) {
    const lines = text.split('\n');
    const extractedOptions: string[] = [];
    let newText = "";

    for (const line of lines) {
      const lowerCaseLine = line.toLowerCase();
      // Improved regex to catch 1. 2. 3. or 1) 2) 3) or Option 1: etc.
      if (/^(\d+[\.\)]|opci[oó]n\s*\d+\:?)/i.test(lowerCaseLine)) {
        // It's likely an option
        const separatorIndex = line.search(/[\.\)\:]/);
        if (separatorIndex !== -1) {
          const optionText = line.slice(separatorIndex + 1).trim();
          if (optionText) extractedOptions.push(optionText);
        }
      } else {
        newText += line + "\n";
      }
    }

    // Fallback if regex fails but we have 3 distinct short lines at the end? 
    // For now rely on the prompt instructions.

    console.log('Opciones extraídas:', extractedOptions);
    return { options: extractedOptions, newText: newText.trim() };
  }

  function handleTextComplete() {
    // Show options when text finishes typing
    toggleOptions(true);
  }

  async function generateAudio(text: string) {
    setIsLoadingAudio(true);
    try {
      let client = genAIClient;
      if (!client) {
        client = new GoogleGenAI({ apiKey: userToken });
        setGenAIClient(client);
      }

      const response = await client.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: text }] }],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (data) {
        setAudioData(data);
        // Calculate duration logic (24kHz, 1 channel, 16bit = 2 bytes per sample -> 48000 bytes/sec)
        // Base64 size * 3/4 = approx byte size
        const byteLength = (data.length * 3) / 4;
        const durationSeconds = byteLength / 48000;
        setCurrentAudioDuration((durationSeconds * 1000) + 1000); // ms + 1s buffer for playback start delay
      }

    } catch (error) {
      console.error("Error generating audio:", error);
    } finally {
      setIsLoadingAudio(false);
    }
  }

  async function startGame() {
    toggleSpinner(true);
    toggleOptions(false);
    setActualContent(null);
    setAudioData(undefined); // Reset audio
    setCurrentImage(null);

    const introPrompt = t("intro_prompt", { gameType: gameType });
    // Update history with initial prompt
    setGameHistory(prev => [...prev, { role: "user", parts: [{ text: introPrompt }] }]);
    const introText = await fetchGeminiResponse(introPrompt);
    // Update history with model response
    setGameHistory(prev => [...prev, { role: "model", parts: [{ text: introText }] }]);

    const { options: introOptions, newText } = extractOptions(introText);
    // setGameContent moved after audio generation to prevent premature typing
    // setGameContent((prev) => [...prev, newText]); 

    // Generate audio for the new text *before* showing the options
    await Promise.all([generateAudio(newText), generateGameImage(newText)]);

    // Now update content, so Typewriter has correct duration
    setGameContent((prev) => [...prev, newText]);

    if (!voicesLoaded) {
      const checkVoicesInterval = setInterval(() => {
        if (voicesLoaded) {
          clearInterval(checkVoicesInterval);
          setActualContent(newText);
        }
      }, 100);
    } else {
      setActualContent(newText);
    }

    updateOptionButtons(introOptions);

    updateOptionButtons(introOptions);

    toggleSpinner(false);
    // toggleOptions(true); // Removed: driven by Typewriter onComplete
  }

  function updateOptionButtons(currentOptions: string[]) {
    const buttons = [option1, option2, option3];
    for (let i = 0; i < 3; i++) {
      const btn = buttons[i].current;
      if (btn) {
        if (currentOptions[i]) {
          btn.textContent = currentOptions[i];
          btn.disabled = false;
        } else {
          btn.textContent = `Opción ${i + 1}`;
          btn.disabled = true; // Disable if no option found
        }
      }
    }
  }

  async function sendChoice(choiceIndex: number) {
    toggleOptions(false);
    toggleSpinner(true);
    setActualContent(null);
    setAudioData(undefined); // Reset audio
    setCurrentImage(null);
    setCurrentAudioDuration(0);

    // Get the text of the chosen option
    const buttons = [option1, option2, option3];
    const choiceText = buttons[choiceIndex - 1].current?.textContent || `Option ${choiceIndex}`;

    const prompt = `I choose option ${choiceIndex}: ${choiceText}. What happens next?`;

    // Update history with user choice
    setGameHistory(prev => [...prev, { role: "user", parts: [{ text: prompt }] }]);

    const response = await fetchGeminiResponse(prompt);

    // Update history with model response
    setGameHistory(prev => [...prev, { role: "model", parts: [{ text: response }] }]);

    const { options: responseOptions, newText } = extractOptions(response);

    updateOptionButtons(responseOptions);

    // setGameContent and setActualContent moved after audio generation
    // setGameContent((prev) => [...prev, newText]);
    // setActualContent(newText);

    // Generate audio *before* showing the options
    const audioPromise = generateAudio(newText);
    const imagePromise = generateGameImage(newText);

    await Promise.all([audioPromise, imagePromise]);

    let finalContent = newText;

    if (response.toLowerCase().includes(t("game_end")) || response.toLowerCase().includes("fin de la aventura")) {
      finalContent += `\n\n${t("game_restart")}`;
      if (option1.current) option1.current.disabled = true;
      if (option2.current) option2.current.disabled = true;
      if (option3.current) option3.current.disabled = true;
    }

    setGameContent((prev) => [...prev, finalContent]);
    setActualContent(finalContent);

    toggleSpinner(false);
  }

  // Image Generation
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  async function generateGameImage(text: string) {
    const imagePrompt = `Scene description: ${text}. Style: ${gameType} digital art, immersive, atmospheric, highly detailed.`;

    // Strategy 1: Try Gemini Imagen (High Quality, requires billing)
    let imageUrl = await generateImagen(imagePrompt);

    // Strategy 2: Fallback to Pollinations.ai (Free, reliable)
    if (!imageUrl) {
      console.log("Fallback to Pollinations.ai...");
      imageUrl = await generatePollinations(imagePrompt);
    }

    if (imageUrl) {
      setCurrentImage(imageUrl);
    } else {
      console.warn("All image generation strategies failed.");
      setCurrentImage(null);
    }
  }

  async function generateImagen(imagePrompt: string): Promise<string | null> {
    try {
      let client = genAIClient;
      if (!client) {
        client = new GoogleGenAI({ apiKey: userToken });
        setGenAIClient(client);
      }

      console.log("Attempting Gemini Flash Image generation...");

      // Use the Nano Banana model (gemini-2.5-flash-image) which supports generateContent
      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
          parts: [
            { text: imagePrompt }
          ]
        }
      });

      // Extract image data from parts
      if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            // The SDK usually returns standard base64 in inlineData.data
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
      }

    } catch (error: any) {
      console.warn("Gemini Flash Image generation failed:", error.message || error);
    }
    return null;
  }

  async function generatePollinations(prompt: string): Promise<string | null> {
    try {
      console.log("Attempting Pollinations.ai generation...");
      const encodedPrompt = encodeURIComponent(prompt);
      const seed = Math.floor(Math.random() * 10000);
      const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?nologo=true&seed=${seed}&width=800&height=450&model=flux`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`Pollinations API error: ${response.statusText}`);

      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Pollinations generation failed:", error);
      return null;
    }
  }

  // Gemini API Integration
  const [genAIClient, setGenAIClient] = useState<any>(null);

  async function fetchGeminiResponse(prompt: string): Promise<string> {
    try {
      let client = genAIClient;
      if (!client) {
        client = new GoogleGenAI({ apiKey: userToken });
        setGenAIClient(client);
      }

      // Construct prompt from history
      let fullPrompt = "";
      gameHistory.forEach(msg => {
        const text = msg.parts ? msg.parts[0].text : "";
        fullPrompt += `${msg.role === 'user' ? 'User' : 'Model'}: ${text}\n`;
      });
      fullPrompt += `User: ${prompt}\nModel:`;

      const response = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: fullPrompt,
        config: {
          temperature: 0.7,
        }
      });

      const text = response.text;
      return text || "No response text";

    } catch (error) {
      console.error("Error fetching from Gemini:", error);
      return "Error: Could not connect to the AI. Please check your API key and try again.";
    }
  }

  function resetGame() {
    window.speechSynthesis.cancel();
    toggleOptions(false);
    setGameContent([]);
    setGenAIClient(null); // Reset client to force re-initialization
    setGameHistory([
      {
        role: "user",
        parts: [{ text: t("game_history_content", { gameType: gameType }) }],
      },
    ]);
    startGame();
  }

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    initializeGame();
  }, [voicesLoaded]);

  const initializeGame = () => {
    if (voicesLoaded && !genAIClient) { // Only start if voices are loaded and client is not yet initialized
      startGame();
    }
  };

  return (
    <>
      <div className="tools-buttons-container">
        <div>
          <BackgroundMusic audioFile={audioFile} />
          {(voicesLoaded && actualContent != null) && (
            <TextNarrator
              text={actualContent}
              voice={selectedVoice}
              audioData={audioData}
              isLoadingAudio={isLoadingAudio}
              onComplete={handleTextComplete}
            />
          )}
        </div>
        <button onClick={resetGame} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <FiRotateCw color="white" size={30} />
        </button >
      </div>
      <div ref={gameCarousel}>
        {currentImage && (
          <div className="game-image-container fade-in">
            <img src={currentImage} alt="Scene visualization" className="game-scene-image" />
          </div>
        )}
        <Carousel
          showArrows={true}
          showStatus={false}
          showThumbs={false}
          showIndicators={false}
          infiniteLoop={false}
          selectedItem={gameContent.length - 1}
        >
          {gameContent.map((item, index) => (
            <div id="game-content" key={index}>
              <p style={{ whiteSpace: 'pre-line' }}>
                <Typewriter
                  text={item}
                  isActive={index === gameContent.length - 1}
                  duration={index === gameContent.length - 1 ? currentAudioDuration : 0}
                // onComplete removed to prevent premature button loading
                />
              </p>
            </div>
          ))}
        </Carousel>
      </div>
      <div ref={spinner} className="spinner">{t('loadingText')}</div>
      <div ref={options} id="options" className="hidden">
        <p className="choose-instruction fade-in-delayed">{t("choose_option")}</p>
        <button ref={option1} onClick={() => sendChoice(1)}>Opción 1</button>
        <button ref={option2} onClick={() => sendChoice(2)}>Opción 2</button>
        <button ref={option3} onClick={() => sendChoice(3)}>Opción 3</button>
      </div>
    </>
  );

}
export default Game;
