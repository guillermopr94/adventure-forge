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

  // Cinematic State
  const [cinematicSegments, setCinematicSegments] = useState<{ text: string; image?: string }[]>([]);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);

  // Retro-compatibility (or fallback): gameContent handles the text history.
  // In cinematic mode, gameContent aggregates the text as it plays? 
  // Or do we just use gameContent for the transcript log?
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
      setActualContent(visualText);
      // Cinematic: We don't push to gameContent log for every token.
      // But for current logic compatibility, we might need to.
      // Ideally, the "Typewriter" just displays visualText.
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

  // General processing state (Backend API calls for Text/Image)
  const [isProcessing, setIsProcessing] = useState(!!savedGameState);

  // Spinner handles ONLY major processing (initial load / text generation).
  // Audio loading should happen in background or be non-intrusive.
  const showSpinner = isProcessing;



  function extractOptions(text: string) {
    const lines = text.split('\n');
    let extractedOptions: string[] = [];
    let newText = "";

    // Specific delimiter check first
    if (text.includes("[OPTIONS]")) {
      const parts = text.split("[OPTIONS]");
      newText = parts[0].trim();
      const optionsPart = parts[1].trim();
      extractedOptions = optionsPart.split('\n').filter(l => l.trim().length > 0).map(l => l.replace(/^\d+[\.\)]\s*/, '').trim());
    } else {
      // Fallback to heuristic
      for (const line of lines) {
        const lowerCaseLine = line.toLowerCase();
        if (/^(\d+[\.\)]|opci[oó]n\s*\d+\:?)/i.test(lowerCaseLine)) {
          const separatorIndex = line.search(/[\.\)\:]/);
          if (separatorIndex !== -1) {
            const optionText = line.slice(separatorIndex + 1).trim();
            if (optionText) extractedOptions.push(optionText);
          }
        } else {
          newText += line + "\n";
        }
      }
    }
    return { options: extractedOptions, newText: newText.trim() };
  }

  // Helper to split into 3 paragraphs
  function splitIntoParagraphs(text: string): string[] {
    return text.split("[PARAGRAPH]").map(p => p.trim()).filter(p => p.length > 0);
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
    toggleOptions(false);
    setActualContent(null);
    setCurrentImage(null);

    // Strict Cinematic Prompt
    const introPrompt = `${t("intro_prompt", { gameType: gameType })} 
    IMPORTANT: You must output exactly 3 distinct paragraphs describing the scene progressively. 
    Separate each paragraph with the tag [PARAGRAPH]. 
    After the 3 paragraphs, output the tag [OPTIONS] followed by 3 choices.`;
    // Update history with initial prompt
    setGameHistory(prev => [...prev, { role: "user", parts: [{ text: introPrompt }] }]);
    const introText = await fetchGeminiResponse(introPrompt);
    // Update history with model response
    setGameHistory(prev => [...prev, { role: "model", parts: [{ text: introText }] }]);

    const { options: introOptions, newText } = extractOptions(introText);

    // Process Cinematic Segments
    const paragraphs = splitIntoParagraphs(newText);
    // Fallback if split fails
    const validParagraphs = paragraphs.length > 0 ? paragraphs : [newText];

    const initialSegments = validParagraphs.map(p => ({ text: p, image: undefined }));
    setCinematicSegments(initialSegments);
    setCurrentSegmentIndex(0);

    // 1. Generate FIRST image and audio blocking
    // This ensures the game starts with at least one complete segment
    const firstSegmentText = validParagraphs[0];

    // Prepare Image for first segment
    const imagePromise = generateGameImage(firstSegmentText);

    await Promise.all([imagePromise]);

    const firstImage = await imagePromise;

    // Update state with first image
    setCinematicSegments(prev => {
      const copy = [...prev];
      if (copy[0]) copy[0].image = firstImage;
      return copy;
    });

    setCurrentImage(firstImage || null);
    updateOptionButtons(introOptions);

    // Initial Trigger is handled by the useEffect watching [cinematicSegments, currentSegmentIndex]
    // which splits sentences and starts playSentence.
    // So we don't need to manually call prepareText here anymore for the INITIAL segment logic.
    // However, useEffect might not trigger if index is 0 and it was 0?
    // We set index to 0, which is initial. But cinematicSegments array changed.
    // So useEffect SHOULD trigger.

    // BUT we need to ensure audio is pre-fetched? 
    // playSentence call in useEffect will call prepareText.

    setIsProcessing(false);

    // 2. Generate remaining images in background
    if (validParagraphs.length > 1) {
      // We do not await this, so the game continues
      (async () => {
        for (let i = 1; i < validParagraphs.length; i++) {
          const img = await generateGameImage(validParagraphs[i]);
          setCinematicSegments(prev => {
            const copy = [...prev];
            if (copy[i]) copy[i].image = img;
            return copy;
          });
        }
      })();
    }
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

    const prompt = `I choose option ${choiceIndex}: ${choiceText}. What happens next?
    IMPORTANT: You must output exactly 3 distinct paragraphs describing the scene progressively. 
    Separate each paragraph with the tag [PARAGRAPH]. 
    After the 3 paragraphs, output the tag [OPTIONS] followed by 3 choices.`;

    // Update history with user choice
    setGameHistory(prev => [...prev, { role: "user", parts: [{ text: prompt }] }]);

    const response = await fetchGeminiResponse(prompt);

    // Update history with model response
    setGameHistory(prev => [...prev, { role: "model", parts: [{ text: response }] }]);

    const { options: responseOptions, newText } = extractOptions(response);
    // Correctly use the previously extracted variables
    updateOptionButtons(responseOptions);

    const paragraphs = splitIntoParagraphs(newText);

    // If AI fails to adhere to format (e.g. 1 paragraph), fallback to single segment
    const validParagraphs = paragraphs.length > 0 ? paragraphs : [newText];

    const initialSegments = validParagraphs.map(p => ({ text: p, image: undefined }));
    setCinematicSegments(initialSegments);
    setCurrentSegmentIndex(0);

    // 1. Generate FIRST image and audio blocking
    const firstSegmentText = validParagraphs[0];

    const audioPromise = prepareText(firstSegmentText);
    const imagePromise = generateGameImage(firstSegmentText);

    await Promise.all([audioPromise, imagePromise]);

    const firstImage = await imagePromise;

    setCinematicSegments(prev => {
      const copy = [...prev];
      if (copy[0]) copy[0].image = firstImage;
      return copy;
    });

    setCurrentImage(firstImage || null);
    setGameContent(prev => [...prev, ""]);

    start();
    setActualContent(firstSegmentText);

    let finalContent = newText; // For logic reference

    if (response.toLowerCase().includes(t("game_end")) || response.toLowerCase().includes("fin de la aventura")) {
      // Handle end game logic
    }

    setIsProcessing(false);

    // 2. Generate remaining images in background
    if (validParagraphs.length > 1) {
      (async () => {
        for (let i = 1; i < validParagraphs.length; i++) {
          const img = await generateGameImage(validParagraphs[i]);
          setCinematicSegments(prev => {
            const copy = [...prev];
            if (copy[i]) copy[i].image = img;
            return copy;
          });
        }
      })();
    }
  }

  // --- Cinematic Transition Logic ---
  // --- Cinematic Transition Logic (Moved below) ---

  // Image Generation
  // const [currentImage, setCurrentImage] = useState<string | null>(savedGameState?.currentImage || null); // Already declared above

  async function generateGameImage(text: string): Promise<string | undefined> {
    const imagePrompt = `Scene description: ${text.substring(0, 300)}. Style: ${gameType} digital art, cinematic, immersive, atmospheric, highly detailed.`;

    try {
      //   console.log("Requesting Image from Backend...");
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
        if (data.image) return data.image; // Return, don't set state directly
      } else {
        console.warn("Backend Image Failed");
      }
    } catch (e) {
      console.warn("Backend Image Error:", e);
    }
    return undefined;
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
        currentImages: cinematicSegments.map(s => s.image || ""), // Save all current images
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

  // --- Helper to split text into sentences ---
  function splitIntoSentences(text: string): string[] {
    return text.match(/[^.!?]+[.!?]+["']?|[^.!?]+$/g) || [text];
  }

  // --- Cinematic Overlay Logic ---
  const [currentSentence, setCurrentSentence] = useState<string>("");
  const [overlayVisible, setOverlayVisible] = useState(false);

  // Override advanceCinematicSegment to handle sentence-by-sentence
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [sentences, setSentences] = useState<string[]>([]);

  const playSentence = async (text: string) => {
    if (!text) return;
    setOverlayVisible(false); // Brief fade out between sentences?
    // Actually, improved "Reset It" might mean:
    // Text 1 appears -> Audio -> Text 1 fades -> Text 2 appears...

    // Slight delay to ensure fade out transition if already visible
    // But setting state is batched.

    setTimeout(async () => {
      setCurrentSentence(text);
      setOverlayVisible(true);
      await prepareText(text);
      start();
    }, 200);
  };

  // When a new segment starts, we split it into sentences and start logic
  useEffect(() => {
    if (cinematicSegments[currentSegmentIndex]) {
      const text = cinematicSegments[currentSegmentIndex].text;
      const newSentences = splitIntoSentences(text);
      setSentences(newSentences);
      setCurrentSentenceIndex(0);

      // Start playing the first sentence immediately
      if (newSentences.length > 0) {
        playSentence(newSentences[0]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSegmentIndex, cinematicSegments]);

  // Called when audio for the VALID sentence ends
  const advanceSentence = async () => {
    setOverlayVisible(false); // Fade out old
    // Short delay for fade
    await new Promise(r => setTimeout(r, 600));

    const nextIdx = currentSentenceIndex + 1;
    if (nextIdx < sentences.length) {
      setCurrentSentenceIndex(nextIdx);
      playSentence(sentences[nextIdx]);
    } else {
      // End of paragraph, go to next Segment (Image change)
      advanceCinematicSegment();
    }
  };

  const advanceCinematicSegment = async () => {
    const nextIndex = currentSegmentIndex + 1;
    if (nextIndex < cinematicSegments.length) {

      // Wait for image if it's still generating
      let nextSegment = cinematicSegments[nextIndex];
      let retries = 0;
      while (!nextSegment.image && retries < 20) {
        await new Promise(r => setTimeout(r, 500));
        nextSegment = cinematicSegments[nextIndex];
        break; // Simplifying logic as discussed
      }

      setCurrentSegmentIndex(nextIndex);

    } else {
      // Sequence finished, show options
      setAreOptionsVisible(true);
    }
  }

  return (
    <div className={`game-container`}>
      <Toaster position="top-right" />
      <BackgroundMusic audioFile={audioFile} />

      {/* Hidden Narrator to drive Audio */}
      {((voicesLoaded || !!audioData) && actualContent != null) && (
        <TextNarrator
          text={actualContent}
          voice={selectedVoice}
          audioData={audioData}
          isLoadingAudio={isLoadingAudio}
          onComplete={() => {
            onAudioComplete();
            // Instead of directly advancing segment, we advance SENTENCE
            advanceSentence();
          }}
        />
      )}

      {/* Main Stage */}
      <div className="game-image-container fade-in">
        {/* Layered Images for Crossfade could be implemented here, 
             for now just the current image */}
        {currentImage && (
          <img src={currentImage} alt="Scene" className="game-scene-image" />
        )}

        {/* Cinematic Text Overlay */}
        <div className={`cinematic-text-overlay ${overlayVisible ? 'visible' : ''}`}>
          <p>{currentSentence}</p>
        </div>
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
