import React, { useRef, useEffect, useState } from "react";
import { config } from "../../common/config/config";
import { useSmartAudio } from "../../common/hooks/useSmartAudio";
import { useLanguage, useTranslation } from "../../common/language/LanguageContext";
import { useNavigation } from "../../common/contexts/NavigationContext";
import "./Game.css";
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import TextNarrator from "../../common/components/TextNarrator/TextNarrator";
import { FiSave } from 'react-icons/fi';
import BackgroundMusic from "../../common/components/BackgroundMusic/BackgroundMusic";
import { useAuth } from "../../common/contexts/AuthContext";
import { GameService } from "../../common/services/GameService";
import toast, { Toaster } from 'react-hot-toast';


import Typewriter from "./components/Typewriter";
import { getAdventureType, AdventureGenre } from "../../common/resources/availableTypes";
import { AudioGenerator } from "../../common/services/ai/AudioGenerator";
import { useTheme } from "../../common/theme/ThemeContext";


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
  const gameCarousel = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { setUserToken, setOpenaiKey, setPollinationsToken, pollinationsToken, navigate, savedGameState, setSavedGameState } = useNavigation(); // Get setters and navigate
  const { user } = useAuth();
  const { setTheme } = useTheme();
  const [voicesLoaded, setVoicesLoaded] = useState(false);

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [gameContent, setGameContent] = useState<string[]>(
    savedGameState
      ? (savedGameState.gameContent.length > 0
        ? [...savedGameState.gameContent.slice(0, -1), ""]
        : [])
      : []
  );
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

  const [gameHistory, setGameHistory] = useState<any[]>(
    savedGameState ? savedGameState.gameHistory : [
      {
        role: "user", // Gemini uses 'user' and 'model' roles, but for history context we can adapt
        parts: [{ text: t("game_history_content", { gameType: gameType }) }],
      },
    ]);

  // General processing state (Backend API calls)
  const [isProcessing, setIsProcessing] = useState(!!savedGameState);

  // Spinner handles both general processing and audio loading
  const showSpinner = isProcessing || isLoadingAudio;



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
    // toggleOptions(true); // Removed to wait for audio/typewriter completion
  }



  // Image Generation
  const [currentImage, setCurrentImage] = useState<string | null>(savedGameState?.currentImage || null);
  const [isGameStarted, setIsGameStarted] = useState(!!savedGameState);

  async function startGame() {
    if (savedGameState) return; // Don't start if restored

    setIsGameStarted(true);
    setIsProcessing(true);
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

    // Set actual content immediately to signal audio context
    setActualContent(newText);

    // Optional: wait for voices if needed for other logic, but content should be ready
    if (!voicesLoaded) {
      // Just a check, no longer blocking actualContent
    }

    updateOptionButtons(introOptions);

    setIsProcessing(false);
    // toggleOptions(true); // Removed: driven by Typewriter onComplete
  }

  // Add state for options to ensure reliable saving
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);

  // Restore options and audio on load
  useEffect(() => {
    if (savedGameState && savedGameState.gameContent.length > 0) {
      // 1. Restore Options
      let restoredOptions: string[] = [];
      if (savedGameState.currentOptions && savedGameState.currentOptions.length > 0) {
        restoredOptions = savedGameState.currentOptions;
      } else {
        // Fallback legacy extraction
        const lastContent = savedGameState.gameContent[savedGameState.gameContent.length - 1];
        const extracted = extractOptions(lastContent);
        restoredOptions = extracted.options;
      }

      // Update options state immediately so they are ready when audio finishes
      if (restoredOptions.length > 0) {
        updateOptionButtons(restoredOptions);
      }

      // 2. Trigger Audio for the last content
      const lastText = savedGameState.gameContent[savedGameState.gameContent.length - 1];
      if (lastText && voicesLoaded) {
        // Use AI Audio generation instead of direct text setting
        prepareText(lastText).then(() => {
          start();
          setIsProcessing(false);
        }).catch(err => {
          console.error("Error preparing audio on load:", err);
          // Fallback if audio fails: show options immediately
          setActualContent(lastText);
          setGameContent(prev => {
            const copy = [...prev];
            copy[copy.length - 1] = lastText;
            return copy;
          });
          setAreOptionsVisible(true);
          setIsProcessing(false);
        });
      } else {
        setIsProcessing(false);
      }
    } else {
      setIsProcessing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedGameState, voicesLoaded]);

  function updateOptionButtons(opts: string[]) {
    setCurrentOptions(opts); // Save to state
    const buttons = [option1, option2, option3];
    for (let i = 0; i < 3; i++) {
      const btn = buttons[i].current;
      if (btn) {
        if (opts[i]) {
          btn.textContent = opts[i];
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
    setIsProcessing(true);
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
    setActualContent(newText);


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

    // setActualContent(finalContent);

    setIsProcessing(false);
  }

  // Image Generation
  // const [currentImage, setCurrentImage] = useState<string | null>(savedGameState?.currentImage || null); // Already declared above

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voicesLoaded]);

  async function handleSave() {
    if (!user) return;
    const saveToast = toast.loading('Saving game...');
    try {
      const result = await GameService.saveGame({
        userId: user.googleId,
        genreKey: genreKey,
        gameHistory: gameHistory,
        gameContent: gameContent,
        currentOptions: currentOptions,
        currentImage: currentImage || undefined,
        _id: savedGameState?._id
      });

      if (result) {
        setSavedGameState(result);
      }

      toast.success("Game Saved!", { id: saveToast });
    } catch (e) {
      toast.error("Failed to save game", { id: saveToast });
    }
  }

  const initializeGame = () => {
    // If not started and NOT restored (savedGameState handles isGameStarted=true), then start
    // But isGameStarted is initialized to !!savedGameState.
    // So if savedGameState is present, isGameStarted is true.
    // If NOT present, isGameStarted is false.
    if (voicesLoaded && !isGameStarted) {
      startGame();
    }
  };

  const { goBack } = useNavigation();

  function handleExit() {
    window.speechSynthesis.cancel();
    goBack();
  }



  // Options Visibility Logic (Pure React)
  // We use currentOptions which is already state. If it has items, we show options? 
  // No, valid options might be loaded but hidden during TTS.
  // We need an explicit visibility state.
  const [areOptionsVisible, setAreOptionsVisible] = useState(false);

  // Sync visibility with options availability and loading state
  // But strictly controlled: only show when we decide (e.g. after TTS or load)

  // Update toggleOptions to use state (renaming internal helper if needed or just using setAreOptionsVisible)
  function toggleOptions(show: boolean) {
    setAreOptionsVisible(show);
  }

  // Effect to restore visibility on load
  useEffect(() => {
    if (savedGameState && savedGameState.currentOptions && savedGameState.currentOptions.length > 0) {
      // If we have options from save, ensure they are visible after a delay
      // Logic inside the existing load useEffect handles calling updateOptionButtons
      // We just need to ensure toggleOptions(true) is called there.
    }
  }, [savedGameState]);

  // Apply theme globally on mount/change
  useEffect(() => {
    if (genreKey) {
      setTheme(genreKey as AdventureGenre);
    }
  }, [genreKey, setTheme]);

  return (
    <div
      className={`game-container`}
    // Styles now handled by ThemeContext globally
    >
      <Toaster position="top-right" />
      <BackgroundMusic audioFile={audioFile} />

      {((voicesLoaded || !!audioData) && actualContent != null) && (
        <TextNarrator
          text={actualContent}
          voice={selectedVoice}
          audioData={audioData}
          isLoadingAudio={isLoadingAudio}
          onComplete={() => {
            onAudioComplete();
            // Ensure options show up after audio if they exist
            if (currentOptions.length > 0) setAreOptionsVisible(true);
          }}
        />
      )}
      <div ref={gameCarousel} style={{ display: showSpinner ? 'none' : 'block' }}>
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
                  onComplete={() => {
                    // Check if TextNarrator is active
                    const textNarratorActive = (voicesLoaded || !!audioData) && actualContent != null;
                    // If no audio is loading, no active narrator logic, and not processing, show options
                    if (!isLoadingAudio && !isProcessing && !textNarratorActive) {
                      setAreOptionsVisible(true);
                    }
                  }}
                />
              </p>
            </div>
          ))}
        </Carousel>
      </div>
      <div className="spinner" style={{ display: showSpinner ? 'block' : 'none' }}>{t('loadingText')}</div>

      {/* Options Container */}
      <div id="options" className={areOptionsVisible && !showSpinner ? "fade-in-up" : ""} style={{ display: (areOptionsVisible && !showSpinner) ? 'flex' : 'none' }}>
        <p className="choose-instruction fade-in-delayed">{t("choose_option")}</p>
        <button ref={option1} onClick={() => sendChoice(1)} disabled={!currentOptions[0]}>{currentOptions[0] || "Option 1"}</button>
        <button ref={option2} onClick={() => sendChoice(2)} disabled={!currentOptions[1]}>{currentOptions[1] || "Option 2"}</button>
        <button ref={option3} onClick={() => sendChoice(3)} disabled={!currentOptions[2]}>{currentOptions[2] || "Option 3"}</button>
      </div>

      {user && (
        <button
          onClick={handleSave}
          title="Save Game"
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: 'var(--panel-bg)', // Use theme var
            color: 'var(--primary-color)',
            border: '2px solid var(--primary-color)',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 1000
          }}
        >
          <FiSave size={24} />
        </button>
      )}

      <button
        onClick={handleExit}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          background: 'transparent',
          border: 'none',
          color: 'var(--text-color)',
          fontSize: '1.5rem',
          cursor: 'pointer',
          zIndex: 100
        }}>
        ✕
      </button>
    </div>
  );

}
export default Game;
