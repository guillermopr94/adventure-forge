import React, { useRef, useEffect, useState } from "react";
import { config } from "../config";
import { useSmartAudio } from "../hooks/useSmartAudio";
import { useLanguage, useTranslation } from "../language/LanguageContext";
import { useNavigation } from "../contexts/NavigationContext";
import "./Game.css";
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import TextNarrator from "../textNarrator/TextNarrator";
import { FiRotateCw } from 'react-icons/fi';
import BackgroundMusic from "../backgroundMusic/BackgroundMusic";


import Typewriter from "./Typewriter";
import { getAdventureType } from "../resources/availableTypes";
import { AudioGenerator } from "../services/ai/AudioGenerator";


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

  // AI Service Initialization
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [audioGenerator, setAudioGenerator] = useState<AudioGenerator | null>(null);

  useEffect(() => {
    // Define a simple backend audio generator
    const backendAudioGenerator: AudioGenerator = {
      shouldSplitText: false, // Let backend handle full text or simple chunks
      generate: async (text: string) => {
        try {
          console.log("Requesting Audio from Backend...");
          const response = await fetch(`${config.apiUrl}/ai/audio`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-google-api-key': userToken,
              'x-pollinations-token': pollinationsToken,
              'x-openai-api-key': openaiKey || ''
            },
            body: JSON.stringify({
              text,
              voice: selectedVoice?.name || 'alloy',
              genre: genreKey,
              lang: language
            })
          });
          if (!response.ok) throw new Error("Backend Audio Failed");
          const data = await response.json();
          return data.audio;
        } catch (e) {
          console.warn("Backend Audio Error:", e);
          return null;
        }
      }
    };
    setAudioGenerator(backendAudioGenerator);

  }, [userToken, openaiKey, pollinationsToken, language, genreKey, selectedVoice]);

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
    setIsGameStarted(true);
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

    try {
      console.log("Requesting Image from Backend...");
      const response = await fetch(`${config.apiUrl}/ai/image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-google-api-key': userToken
        },
        body: JSON.stringify({ prompt: imagePrompt })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.image) setCurrentImage(data.image);
      } else {
        console.warn("Backend Image Failed");
        setCurrentImage(null);
      }
    } catch (e) {
      console.warn("Backend Image Error:", e);
      setCurrentImage(null);
    }
  }

  // Removed old generateImagen / generatePollinations functions


  async function fetchGeminiResponse(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${config.apiUrl}/ai/text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-google-api-key': userToken,
          'x-pollinations-token': pollinationsToken
        },
        body: JSON.stringify({
          prompt,
          history: gameHistory
          // Model selection is handled by the backend now
        })
      });

      if (!response.ok) throw new Error("Backend Text Failed");
      const data = await response.json();
      return data.text;
    } catch (e) {
      console.error("Backend Text Error:", e);
      return "Error: Could not connect to any AI service. Please check your internet connection.";
    }
  }

  function resetGame() {
    window.speechSynthesis.cancel();
    toggleOptions(false);
    setGameContent([]);
    setIsGameStarted(false); // Reset game started state
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
    if (voicesLoaded && !isGameStarted) { // Only start if voices are loaded and not started
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
