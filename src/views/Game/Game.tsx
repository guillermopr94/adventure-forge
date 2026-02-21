import React, { useRef, useEffect, useState, useCallback } from "react";
import { config } from "../../common/config/config";
import { useSmartAudio } from "../../common/hooks/useSmartAudio";
import { useGameStream } from "../../common/hooks/useGameStream";
import { splitIntoSentences } from "../../common/utils/textSplitter";
import { useLanguage, useTranslation } from "../../common/language/LanguageContext";
import { useNavigation } from "../../common/contexts/NavigationContext";
import "./Game.css";
import TextNarrator from "../../common/components/TextNarrator/TextNarrator";
import { FiSave } from 'react-icons/fi';
import BackgroundMusic from "../../common/components/BackgroundMusic/BackgroundMusic";
import { useAuth } from "../../common/contexts/AuthContext";
import { GameService } from "../../common/services/GameService";
import toast, { Toaster } from 'react-hot-toast';
import { withRetry } from "../../common/utils/resilience";

import { getAdventureType, AdventureGenre } from "../../common/resources/availableTypes";
import { AudioGenerator } from "../../common/services/ai/AudioGenerator";
import { useTheme } from "../../common/theme/ThemeContext";
import Typewriter from "./components/Typewriter";
import StreamErrorState from "./components/StreamErrorState";

interface GameProps {
  userToken: string; // Gemini API Key
  authToken: string | null; // Google Auth ID Token
  openaiKey?: string;
  gameType: string;
  genreKey: string;
}

const Game: React.FC<GameProps> = ({ userToken, authToken, openaiKey, gameType, genreKey }): React.ReactElement => {

  const { t } = useTranslation();
  const { language } = useLanguage();
  const { setPollinationsToken, pollinationsToken, navigate, savedGameState, setSavedGameState, goBack } = useNavigation();
  const { user, token } = useAuth();
  const { setTheme } = useTheme();

  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Cinematic State
  const [cinematicSegments, setCinematicSegments] = useState<{ text: string; image?: string }[]>([]);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  // Text & Interaction State
  const [gameContent, setGameContent] = useState<string[]>([]);
  const [gameHistory, setGameHistory] = useState<any[]>(savedGameState ? savedGameState.gameHistory : []);
  const [currentOptions, setCurrentOptions] = useState<string[]>(savedGameState?.currentOptions || []);
  const [areOptionsVisible, setAreOptionsVisible] = useState(false);
  const [isOptionsLoading, setIsOptionsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitialTurnLoading, setIsInitialTurnLoading] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(!!savedGameState);

  // Cinematic Overlay State
  const [currentSentence, setCurrentSentence] = useState<string>("");
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [sentences, setSentences] = useState<string[]>([]);

  // Image Fallback State
  const [isImageMissing, setIsImageMissing] = useState(false);

  // Theme & Audio Config
  const audioFile = getAdventureType(genreKey).music;

  // AI Infrastructure Refs
  const cinematicSegmentsRef = useRef<{ text: string; image?: string }[]>([]);
  useEffect(() => { cinematicSegmentsRef.current = cinematicSegments; }, [cinematicSegments]);

  const isAdvancingRef = useRef(false);
  const currentSentenceIndexRef = useRef(0);

  // --- Voice Handling ---
  const updateVoices = () => {
    const availableVoices = window.speechSynthesis.getVoices();
    console.log("SpeechSynthesis voices updated:", availableVoices.length);
    if (availableVoices.length > 0) {
      setVoices(availableVoices);
      setVoicesLoaded(true);
    }
  };

  useEffect(() => {
    window.speechSynthesis.addEventListener("voiceschanged", updateVoices);
    updateVoices();

    // Safety timeout: If no voices after 2s, just start
    // Browsers like Chrome on Android might not fire voiceschanged or return empty
    const timer = setTimeout(() => {
      console.log("Voice load timeout reached. Current voices:", window.speechSynthesis.getVoices().length);
      setVoicesLoaded(true);
    }, 2000);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", updateVoices);
      clearTimeout(timer);
    };
  }, []);

  const selectedVoice = voices.find((voice) => voice.lang.startsWith(language));

  // --- AI Audio Generation Service ---
  const [audioGenerator, setAudioGenerator] = useState<AudioGenerator | null>(null);

  useEffect(() => {
    const backendAudioGenerator: AudioGenerator = {
      shouldSplitText: false,
      generate: async (text: string) => {
        try {
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'x-google-api-key': userToken,
            'x-pollinations-token': pollinationsToken,
            'x-openai-api-key': openaiKey || ''
          };
          if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
          }

          const response = await withRetry(async () => {
            const res = await fetch(`${config.apiUrl}/ai/audio`, {
              method: 'POST',
              headers,
              body: JSON.stringify({ text, voice: selectedVoice?.name || 'alloy', genre: genreKey, lang: language })
            });
            if (!res.ok) throw new Error("Backend Audio Failed");
            return res;
          }, { retries: 2, baseDelay: 500, name: 'Audio Generation' });

          const data = await response.json();
          return data.audio;
        } catch (e) {
          console.warn("Backend Audio Error after retries:", e);
          return null;
        }
      },
      generateBatch: async (texts: string[]) => {
        return { audios: [] };
      }
    };
    setAudioGenerator(backendAudioGenerator);
  }, [userToken, authToken, openaiKey, pollinationsToken, language, genreKey, selectedVoice]);

  // --- Hooks ---
  const handleDurationSet = useCallback((ms: number) => { }, []);

  const advanceSentence = async () => {
    if (isAdvancingRef.current) return;
    isAdvancingRef.current = true;

    try {
      setOverlayVisible(false);
      await new Promise(r => setTimeout(r, 600)); // Fade delay

      const nextIdx = currentSentenceIndexRef.current + 1;
      if (nextIdx < sentences.length) {
        currentSentenceIndexRef.current = nextIdx;
        setCurrentSentenceIndex(nextIdx);
        playSentence(sentences[nextIdx], nextIdx);
      } else {
        await advanceCinematicSegment();
      }
    } finally {
      isAdvancingRef.current = false;
    }
  };

  const handleSequenceEnd = useCallback(() => {
    advanceSentence();
  }, [sentences]);

  const {
    audioData,
    isLoading: isLoadingAudio,
    visualText,
    prepareText,
    prefetch,
    start,
    onAudioComplete,
    cacheAudio
  } = useSmartAudio(
    userToken,
    language,
    genreKey,
    handleDurationSet,
    handleSequenceEnd,
    audioGenerator,
  );

  const { startStream, isStreaming: isStreamProcessing, streamError } = useGameStream(userToken, authToken, pollinationsToken, openaiKey);

  // --- Helper Functions ---
  function toggleOptions(show: boolean) {
    setAreOptionsVisible(show);
  }

  function updateOptionButtons(opts: string[]) {
    setCurrentOptions(opts);
  }

  // --- Core Game Logic ---

  async function sendChoice(choiceIndex: number) {
    toggleOptions(false);
    // #130: Clear stale options immediately so buttons don't show previous turn's choices
    setCurrentOptions([]);
    // #131: Signal loading state for options panel
    setIsOptionsLoading(true);
    setIsProcessing(true);
    setIsInitialTurnLoading(true);
    setCurrentImage(null);
    setIsImageMissing(false);
    setImageError(false);

    const choiceText = currentOptions[choiceIndex - 1] || `Option ${choiceIndex}`;
    const prompt = `I choose option ${choiceIndex}: ${choiceText}. What happens next?`;

    const currentHistory = [...gameHistory, { role: "user", parts: [{ text: prompt }] }];
    setGameHistory(currentHistory);

    await startStream(
      prompt,
      currentHistory,
      selectedVoice?.name || 'alloy',
      genreKey,
      language,
      handleStreamEvent,
      savedGameState?._id
    );
  }

  // --- Playback Logic ---

  const playSentence = async (text: string, index: number) => {
    if (!text) return;

    const nextText = sentences[index + 1];
    if (nextText) prefetch(nextText);

    setTimeout(async () => {
      setCurrentSentence(text);
      setOverlayVisible(true);
      await prepareText(text);
      start();
    }, 200);
  };

  const advanceCinematicSegment = async () => {
    const nextIndex = currentSegmentIndex + 1;
    if (nextIndex < cinematicSegments.length) {
      setCurrentSegmentIndex(nextIndex);
      currentSentenceIndexRef.current = 0;
    } else {
      // #131: Show options; if still loading (stream delayed), isOptionsLoading stays true
      setAreOptionsVisible(true);
      setIsProcessing(false);
    }
  };

  const lastProcessedTextRef = useRef<string | null>(null);

  useEffect(() => {
    const currentSegment = cinematicSegments[currentSegmentIndex];
    if (currentSegment) {
      const text = currentSegment.text;
      setImageError(false); // Reset error state for new segment

      // FIX #34: Decouple text display from image loading
      // Text should ALWAYS render, regardless of image status
      // Update current image if available, but don't block
      if (currentSegment.image && currentImage !== currentSegment.image) {
        setCurrentImage(currentSegment.image);
      } else if (!currentSegment.image && currentImage) {
        setCurrentImage(null);
      }
      if (lastProcessedTextRef.current !== text) {
        lastProcessedTextRef.current = text;

        // Update image state (null if missing)
        if (currentSegment.image) {
          setCurrentImage(currentSegment.image);
          setIsImageMissing(false);
        } else {
          setCurrentImage(null);
          setIsImageMissing(true);
          // Show toast notification when image is missing
          if (currentSegmentIndex === 0) {
            toast('Image loading...', { icon: '🖼️', duration: 2000 });
          }
        }

        // ALWAYS process text, even without image
        const newSentences = splitIntoSentences(text);
        setSentences(newSentences);
        currentSentenceIndexRef.current = 0;

        if (newSentences.length > 0) {
          playSentence(newSentences[0], 0);
        }
      }
    } else {
      lastProcessedTextRef.current = null;
    }
  }, [currentSegmentIndex, cinematicSegments]);


  // --- Initialization & Save ---

  useEffect(() => {
    if (savedGameState && savedGameState.currentOptions) toggleOptions(true);
  }, [savedGameState]);

  useEffect(() => {
    if (genreKey) setTheme(genreKey as AdventureGenre);
  }, [genreKey, setTheme]);

  function resetGame() {
    window.speechSynthesis.cancel();
    toggleOptions(false);
    setGameContent([]);
    setIsGameStarted(false);
    setGameHistory([]);
    startGame();
  }

  async function startGame() {
    setIsGameStarted(true);
    setIsInitialTurnLoading(true);
    setCurrentImage(null);
    setIsImageMissing(false);
    setImageError(false);
    setGameHistory([]);

    const introPrompt = `${t("intro_prompt", { gameType: gameType })}`;

    const currentHistory = [{ role: "user", parts: [{ text: introPrompt }] }];
    setGameHistory(currentHistory);

    await startStream(
      introPrompt,
      currentHistory,
      selectedVoice?.name || 'alloy',
      genreKey,
      language,
      handleStreamEvent,
      savedGameState?._id
    );
  }

  const initializeGame = () => {
    if (!isGameStarted) {
      if (voicesLoaded) {
        startGame();
      }
    }
  };

  useEffect(() => { initializeGame(); }, [voicesLoaded]);

  function handleExit() {
    window.speechSynthesis.cancel();
    goBack();
  }

  async function handleSave() {
    if (!user || !token) return;
    const toastId = toast.loading("Saving...");
    try {
      await GameService.saveGame({
        userId: user.googleId,
        genreKey,
        gameHistory,
        gameContent,
        currentOptions,
        currentImages: cinematicSegments.map(s => s.image || ""),
        _id: savedGameState?._id
      }, token);
      toast.success("Saved!", { id: toastId });
    } catch (e) { toast.error("Save failed", { id: toastId }); }
  }

  const handleRetry = () => {
    if (gameHistory.length === 0) {
      startGame();
    } else {
      const lastUserMessage = [...gameHistory].reverse().find(m => m.role === 'user');
      if (lastUserMessage) {
        // Simple logic: if the last message in history is from user, we re-trigger the stream
        // but we need to find the choice index if it was a choice turn.
        // For now, re-triggering the choice flow is complex without refactoring,
        // so we'll just re-run the start stream with the prompt if available.
        // A better way is to track the "last attempt" parameters.
        const lastPrompt = lastUserMessage.parts[0].text;
        const historyMinusLast = gameHistory.slice(0, -1);
        setGameHistory(historyMinusLast); // startStream will re-add it
        
        // If it looks like a choice, we use sendChoice logic conceptually
        if (lastPrompt.includes("I choose option")) {
            const match = lastPrompt.match(/I choose option (\d+)/);
            if (match) {
                sendChoice(parseInt(match[1]));
                return;
            }
        }
        
        // Fallback for intro or unknown
        startStream(
            lastPrompt,
            historyMinusLast,
            selectedVoice?.name || 'alloy',
            genreKey,
            language,
            handleStreamEvent,
            savedGameState?._id
        );
      } else {
        startGame();
      }
    }
  };

  const handleStreamEvent = (event: any) => {
    if (event.type === 'text_structure') {
      if (event.paragraphs) {
        const newSegments = event.paragraphs.map((p: string) => ({ text: p, image: undefined }));
        setCinematicSegments(newSegments);
        setCurrentSegmentIndex(0);
        currentSentenceIndexRef.current = 0;
        
        if (event.options && event.options.length > 0) {
          updateOptionButtons(event.options);
          setIsOptionsLoading(false);
        }

        const fullText = event.paragraphs.join('\n\n') + "\n\nOptions: " + (event.options?.join(', ') || '');
        setGameHistory(prev => {
          const last = prev[prev.length - 1];
          if (last && last.role === 'model') {
            return [...prev.slice(0, -1), { role: 'model', parts: [{ text: fullText }] }];
          }
          return [...prev, { role: 'model', parts: [{ text: fullText }] }];
        });

        setTimeout(() => setIsInitialTurnLoading(false), 2000);
      }
    }
    else if (event.type === 'image') {
      if (typeof event.index === 'number' && event.data) {
        setCinematicSegments(prev => {
          const copy = [...prev];
          if (copy[event.index!]) copy[event.index!].image = event.data;
          return copy;
        });
        const img = new Image();
        img.src = event.data;
        if (event.index === currentSegmentIndex) {
          setCurrentImage(event.data);
          setIsImageMissing(false);
          if (event.index === 0) setIsInitialTurnLoading(false);
        }
      }
    }
    else if (event.type === 'audio') {
      if (event.text && event.data) cacheAudio(event.text, event.data);
    }
    else if (event.type === 'error') {
      toast.error(`Stream Error: ${event.error}`);
      setIsProcessing(false);
      setIsOptionsLoading(false);
    }
  };


  return (
    <div className={`game-container`}>
      <Toaster position="top-right" />
      <BackgroundMusic audioFile={audioFile} />

      {streamError ? (
        <StreamErrorState 
          errorMessage={streamError} 
          onRetry={handleRetry} 
          onBack={handleExit} 
        />
      ) : isInitialTurnLoading ? (
        <div className="spinner">
          <p>{t('game_loading') || "Forging your destiny..."}</p>
        </div>
      ) : (
        <>
          {((voicesLoaded || !!audioData) && currentSentence !== "") && (
            <TextNarrator
              text={currentSentence}
              voice={selectedVoice}
              audioData={audioData}
              isLoadingAudio={isLoadingAudio}
            />
          )}

          <div
            className="game-image-container fade-in"
            data-testid="game-cinematic-container"
            onClick={() => {
              if (overlayVisible && !isProcessing && !areOptionsVisible) {
                advanceSentence();
              }
            }}
            style={{ cursor: (!isProcessing && !areOptionsVisible) ? 'pointer' : 'default' }}
          >
            {currentImage && !imageError ? (
              <img 
                src={currentImage} 
                alt="Scene" 
                className="game-scene-image" 
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="image-placeholder">
                <div className="shimmer-effect"></div>
                <p className="placeholder-text">
                  {imageError 
                    ? (t('image_error') || "Image failed to load") 
                    : (t('visualizing_scene') || "Visualizing scene...")}
                </p>
              </div>
            )}
            
            <div className={`cinematic-text-overlay ${overlayVisible ? 'visible' : ''}`}>
              <p>
                <Typewriter 
                  text={currentSentence} 
                  isActive={overlayVisible} 
                  duration={currentSentence.length * 40}
                />
              </p>
              <div className="click-hint">{t('click_to_advance') || "Click to advance ▶"}</div>
            </div>
          </div>

          <div
            id="options"
            data-testid="game-options-container"
            className={areOptionsVisible && !isProcessing ? "fade-in-up" : ""}
            style={{ display: (areOptionsVisible && !isProcessing) ? 'flex' : 'none' }}
          >
            {isOptionsLoading ? (
              <div className="options-loading-skeleton" data-testid="options-loading">
                <div className="option-skeleton"></div>
                <div className="option-skeleton"></div>
                <div className="option-skeleton"></div>
              </div>
            ) : (
              <>
                <p className="choose-instruction fade-in-delayed">{t("choose_option")}</p>
                <button onClick={() => sendChoice(1)} disabled={!currentOptions[0]}>
                  {currentOptions[0] || t("choose_option")}
                </button>
                <button onClick={() => sendChoice(2)} disabled={!currentOptions[1]}>
                  {currentOptions[1] || t("choose_option")}
                </button>
                <button onClick={() => sendChoice(3)} disabled={!currentOptions[2]}>
                  {currentOptions[2] || t("choose_option")}
                </button>
              </>
            )}
          </div>
        </>
      )}

      {user && (
        <button onClick={handleSave} className="save-button" style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
          <FiSave size={24} />
        </button>
      )}

      <button onClick={handleExit} className="exit-button" style={{ position: 'fixed', top: 20, left: 20, zIndex: 1000, background: 'transparent', border: 'none', color: 'white', fontSize: '1.5rem' }}>
        ✕
      </button>
    </div>
  );
};

export default Game;
