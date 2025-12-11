import React, { useRef, useEffect, useState } from "react";
import { useSmartAudio } from "../hooks/useSmartAudio";
import { useLanguage, useTranslation } from "../language/LanguageContext";
import { useNavigation } from "../contexts/NavigationContext";
import "./Game.css";
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import TextNarrator from "../textNarrator/TextNarrator";
import { FiRotateCw } from 'react-icons/fi';
import BackgroundMusic from "../backgroundMusic/BackgroundMusic";
import { GoogleGenAI } from "@google/genai";
import Typewriter from "./Typewriter";
import { getAdventureType } from "../resources/availableTypes";
import { TextGenerator } from "../services/ai/TextGenerator";
import { GeminiGenerator } from "../services/ai/GeminiGenerator";
import { PollinationsGenerator } from "../services/ai/PollinationsGenerator";
import { FallbackGenerator } from "../services/ai/FallbackGenerator";
import { AudioGenerator } from "../services/ai/AudioGenerator";
import { PollinationsTTS } from "../services/ai/audio/PollinationsTTS";
import { KokoroTTS } from "../services/ai/audio/KokoroTTS";
import { GeminiTTS } from "../services/ai/audio/GeminiTTS";
import { AudioFallback } from "../services/ai/audio/AudioFallback";
import { OpenAITTS } from "../services/ai/audio/OpenAITTS";

interface GameProps {
  userToken: string;
  openaiKey?: string;
  gameType: string;
  genreKey: string;
}

const Game: React.FC<GameProps> = ({ userToken, openaiKey, gameType, genreKey }): React.ReactElement => {

  const option1 = useRef<HTMLButtonElement>(null);
  const option2 = useRef<HTMLButtonElement>(null);
  const option3 = useRef<HTMLButtonElement>(null);
  const spinner = useRef<HTMLDivElement>(null);
  const options = useRef<HTMLDivElement>(null);
  const gameCarousel = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { setUserToken, setOpenaiKey, setPollinationsToken, pollinationsToken, navigate } = useNavigation(); // Get setters and navigate
  const [voicesLoaded, setVoicesLoaded] = useState(false);

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [gameContent, setGameContent] = useState<string[]>([]);
  const [actualContent, setActualContent] = useState<string | null>(null);

  // AI Service Initialization
  const [genAIClient, setGenAIClient] = useState<any>(null);
  const [textGenerator, setTextGenerator] = useState<TextGenerator | null>(null);
  const [audioGenerator, setAudioGenerator] = useState<AudioGenerator | null>(null);

  useEffect(() => {
    if (userToken) {
      // Auth Error Handlers
      const handleGeminiAuthError = () => {
        console.warn("Invalidating Gemini Token");
        setUserToken("");
        navigate('apikey');
      };

      const handleOpenAIAuthError = () => {
        console.warn("Invalidating OpenAI Key");
        setOpenaiKey("");
      };

      const handlePollinationsAuthError = () => {
        console.warn("Invalidating Pollinations Token");
        setPollinationsToken("");
      };

      // Text Generation Setup
      const geminiFlash = new GeminiGenerator(userToken, "gemini-2.5-flash", handleGeminiAuthError);
      const geminiFlashLite = new GeminiGenerator(userToken, "gemini-2.5-flash-lite", handleGeminiAuthError);
      const pollinationsText = new PollinationsGenerator();

      const textFallback = new FallbackGenerator([
        geminiFlash,
        geminiFlashLite,
        pollinationsText
      ]);
      setTextGenerator(textFallback);

      // Audio Generation Setup
      const pollinationsVoice = PollinationsTTS.getOpenAIVoiceForGenre(genreKey);
      console.log(`Using Pollinations Voice: ${pollinationsVoice} for genre: ${genreKey}`);

      const pollinationsAudio = new PollinationsTTS(pollinationsVoice, genreKey, pollinationsToken, handlePollinationsAuthError);
      const kokoroAudio = new KokoroTTS(language, genreKey);
      const geminiAudio = new GeminiTTS(userToken, handleGeminiAuthError);

      const generators: AudioGenerator[] = [pollinationsAudio];

      if (openaiKey && openaiKey.length > 5) {
        console.log("Adding OpenAI TTS to fallback chain");
        const openAIAudio = new OpenAITTS(openaiKey, genreKey, handleOpenAIAuthError);
        generators.push(openAIAudio);
      }

      generators.push(kokoroAudio);
      generators.push(geminiAudio);


      const audioFallback = new AudioFallback(generators);
      setAudioGenerator(audioFallback);
    }
  }, [userToken, openaiKey, pollinationsToken, language, genreKey]);

  // Audio state handled by useSmartAudio now


  const audioFile = getAdventureType(genreKey).music;

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

  // Hook for Smart Audio (Split & Stream)
  const {
    audioData,
    isLoading: isLoadingAudio,
    visualText,
    visualDuration,
    prepareText,
    start,
    onAudioComplete
  } = useSmartAudio(
    userToken,
    language,
    genreKey,
    () => { }, // setDuration callback no longer needed for sync
    handleTextComplete,
    audioGenerator, // Inject the service
  );

  // Sync visual text from hook to game content
  useEffect(() => {
    if (visualText) {
      setActualContent(visualText);
      setGameContent(prev => {
        if (prev.length === 0) return [visualText];
        const copy = [...prev];
        copy[copy.length - 1] = visualText;
        return copy;
      });
    }
  }, [visualText]);

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



  async function startGame() {
    toggleSpinner(true);
    toggleOptions(false);
    setActualContent(null);
    // setAudioData(undefined); // Reset handled by playText
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
    // Note: We use visualText effect to update content now.
    // However, we need to initialize the content entry first.
    setGameContent((prev) => [...prev, ""]);

    await Promise.all([prepareText(newText), generateGameImage(newText)]);

    // Now both audio (first chunk) and image are ready.
    // Trigger playback
    start();

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
    // setAudioData(undefined); // Reset handled by playText
    setCurrentImage(null);


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


    // Push empty string for new content slot
    setGameContent((prev) => [...prev, ""]);

    // Generate audio *before* showing the options
    // Generate audio *before* showing the options
    const audioPromise = prepareText(newText);
    const imagePromise = generateGameImage(newText);

    await Promise.all([audioPromise, imagePromise]);

    // Trigger playback after loading is complete
    start();

    let finalContent = newText;

    if (response.toLowerCase().includes(t("game_end")) || response.toLowerCase().includes("fin de la aventura")) {
      finalContent += `\n\n${t("game_restart")}`;
      if (option1.current) option1.current.disabled = true;
      if (option2.current) option2.current.disabled = true;
      if (option3.current) option3.current.disabled = true;
    }

    // We rely on visualText to update the main content. 
    // If there is extra content appended (like "Restart"), handle it?
    // Actually, playText only plays the model response.
    // If we manually append, we should update visualText via effect? 
    // Or just let it be. 'playText' drives the audio. 
    // If we want the restart text to appear, we should probably append it to the text passed to playText?
    // But playText is async.

    // For now, if game ends, just let the text play out.
    // The "Restart" text is usually appended. 
    // If we want it spoken, pass it to playText.

    // setGameContent((prev) => [...prev, finalContent]); // Removed, handled by effect
    // setActualContent(finalContent);

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








  async function fetchGeminiResponse(prompt: string): Promise<string> {
    if (!textGenerator) {
      console.error("TextGenerator not initialized");
      return "Error: AI Service not initialized.";
    }

    try {
      return await textGenerator.generate(prompt, gameHistory);
    } catch (error) {
      console.error("All AI services failed:", error);
      return "Error: Could not connect to any AI service. Please check your internet connection and try again.";
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

  const { goBack } = useNavigation();

  function handleExit() {
    window.speechSynthesis.cancel();
    goBack();
  }

  return (
    <>
      <div className="tools-buttons-container">

        {/* Back Button */}
        <button onClick={handleExit} style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '10px' }} title={t("back_to_menu") || "Back"}>
          <span style={{ fontSize: '30px', color: 'white' }}>←</span>
        </button>

        <div>
          <BackgroundMusic audioFile={audioFile} />
          {(voicesLoaded && actualContent != null) && (
            <TextNarrator
              text={actualContent}
              voice={selectedVoice}
              audioData={audioData}
              isLoadingAudio={isLoadingAudio}
              onComplete={onAudioComplete}
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
                  duration={index === gameContent.length - 1 ? visualDuration : 0}
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
