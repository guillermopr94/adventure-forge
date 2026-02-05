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

import { getAdventureType, AdventureGenre } from "../../common/resources/availableTypes";
import { AudioGenerator } from "../../common/services/ai/AudioGenerator";
import { useTheme } from "../../common/theme/ThemeContext";
import Typewriter from "./components/Typewriter";

interface GameProps {
  userToken: string; // Gemini API Key
  authToken: string | null; // Google Auth ID Token
  openaiKey?: string;
  gameType: string;
  genreKey: string;
}

const Game: React.FC<GameProps> = ({ userToken, authToken, openaiKey, gameType, genreKey }): React.ReactElement => {

  const option1 = useRef<HTMLButtonElement>(null);
  const option2 = useRef<HTMLButtonElement>(null);
  const option3 = useRef<HTMLButtonElement>(null);

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

  // Text & Interaction State
  const [gameContent, setGameContent] = useState<string[]>([]);
  const [gameHistory, setGameHistory] = useState<any[]>(savedGameState ? savedGameState.gameHistory : []);
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  const [areOptionsVisible, setAreOptionsVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(!!savedGameState);
  const [isGameStarted, setIsGameStarted] = useState(!!savedGameState);

  // Cinematic Overlay State
  const [currentSentence, setCurrentSentence] = useState<string>("");
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [sentences, setSentences] = useState<string[]>([]);

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

          const response = await fetch(`${config.apiUrl}/ai/audio`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ text, voice: selectedVoice?.name || 'alloy', genre: genreKey, lang: language })
          });
          if (!response.ok) throw new Error("Backend Audio Failed");
          const data = await response.json();
          return data.audio;
        } catch (e) {
          console.warn("Backend Audio Error:", e);
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

  const { startStream, isStreaming: isStreamProcessing } = useGameStream(userToken, authToken, pollinationsToken, openaiKey);

  // --- Helper Functions ---
  function toggleOptions(show: boolean) {
    setAreOptionsVisible(show);
  }

  function updateOptionButtons(opts: string[]) {
    setCurrentOptions(opts);
    const buttons = [option1, option2, option3];
    for (let i = 0; i < 3; i++) {
      if (buttons[i].current) {
        if (opts[i]) {
          buttons[i].current!.textContent = opts[i];
          buttons[i].current!.disabled = false;
        } else {
          buttons[i].current!.textContent = `Option ${i + 1}`;
          buttons[i].current!.disabled = true;
        }
      }
    }
  }

  // --- Core Game Logic ---

  async function sendChoice(choiceIndex: number) {
    toggleOptions(false);
    setIsProcessing(true);
    setCurrentImage(null);

    const buttons = [option1, option2, option3];
    const choiceText = buttons[choiceIndex - 1].current?.textContent || `Option ${choiceIndex}`;
    const prompt = `I choose option ${choiceIndex}: ${choiceText}. What happens next?`;

    const currentHistory = [...gameHistory, { role: "user", parts: [{ text: prompt }] }];
    setGameHistory(currentHistory);

    await startStream(
      prompt,
      currentHistory,
      selectedVoice?.name || 'alloy',
      genreKey,
      language,
      (event) => {
        if (event.type === 'text_structure') {
          if (event.paragraphs) {
            const newSegments = event.paragraphs.map(p => ({ text: p, image: undefined }));
            setCinematicSegments(newSegments);
            setCurrentSegmentIndex(0);
            currentSentenceIndexRef.current = 0;
            if (event.options) updateOptionButtons(event.options);

            const fullText = event.paragraphs.join('\n\n') + "\n\nOptions: " + (event.options?.join(', ') || '');
            setGameHistory(prev => {
              const last = prev[prev.length - 1];
              if (last && last.role === 'model') {
                return [...prev.slice(0, -1), { role: 'model', parts: [{ text: fullText }] }];
              }
              return [...prev, { role: 'model', parts: [{ text: fullText }] }];
            });
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
            if (event.index === 0) setCurrentImage(event.data);
          }
        }
        else if (event.type === 'audio') {
          if (event.text && event.data) {
            cacheAudio(event.text, event.data);
          }
        }
        else if (event.type === 'error') {
          toast.error(`Stream Error: ${event.error}`);
          setIsProcessing(false);
        }
      }
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
      setAreOptionsVisible(true);
      setIsProcessing(false);
    }
  };

  const lastProcessedTextRef = useRef<string | null>(null);

  useEffect(() => {
    const currentSegment = cinematicSegments[currentSegmentIndex];
    if (currentSegment) {
      const text = currentSegment.text;
      
      if (!currentSegment.image) {
          setOverlayVisible(false);
          return; 
      }

      if (lastProcessedTextRef.current !== text || (!currentImage && currentSegment.image)) {
        lastProcessedTextRef.current = text;
        setCurrentImage(currentSegment.image);

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
  }, [currentSegmentIndex, cinematicSegments, currentImage]);


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
    setGameHistory([]);

    const introPrompt = `${t("intro_prompt", { gameType: gameType })} 
     IMPORTANT: You must output exactly 3 distinct paragraphs describing the scene progressively. 
     Separate each paragraph with the tag [PARAGRAPH]. 
     After the 3 paragraphs, output the tag [OPTIONS] followed by 3 choices.`;

    const currentHistory = [{ role: "user", parts: [{ text: introPrompt }] }];
    setGameHistory(currentHistory);

    await startStream(
      introPrompt,
      currentHistory,
      selectedVoice?.name || 'alloy',
      genreKey,
      language,
      (event) => {
        if (event.type === 'text_structure') {
          if (event.paragraphs) {
            const newSegments = event.paragraphs.map(p => ({ text: p, image: undefined }));
            setCinematicSegments(newSegments);
            setCurrentSegmentIndex(0);
            currentSentenceIndexRef.current = 0;
            if (event.options) updateOptionButtons(event.options);
            const fullText = event.paragraphs.join('\n\n') + "\n\nOptions: " + (event.options?.join(', ') || '');
            setGameHistory(prev => {
              const last = prev[prev.length - 1];
              if (last && last.role === 'model') {
                return [...prev.slice(0, -1), { role: 'model', parts: [{ text: fullText }] }];
              }
              return [...prev, { role: 'model', parts: [{ text: fullText }] }];
            });
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
            if (event.index === 0) setCurrentImage(event.data);
          }
        }
        else if (event.type === 'audio') {
          if (event.text && event.data) cacheAudio(event.text, event.data);
        }
        else if (event.type === 'error') {
          toast.error(`Stream Error: ${event.error}`);
          setIsProcessing(false);
        }
      }
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


  return (
    <div className={`game-container`}>
      <Toaster position="top-right" />
      <BackgroundMusic audioFile={audioFile} />

      {((voicesLoaded || !!audioData) && currentSentence !== "") && (
        <TextNarrator
          text={currentSentence}
          voice={selectedVoice}
          audioData={audioData}
          isLoadingAudio={isLoadingAudio}
          onComplete={() => {
            onAudioComplete();
          }}
        />
      )}

      <div 
        className="game-image-container fade-in" 
        onClick={() => {
          if (!isProcessing && !areOptionsVisible) {
            advanceSentence();
          }
        }}
        style={{ cursor: (!isProcessing && !areOptionsVisible) ? 'pointer' : 'default' }}
      >
        {currentImage && (
          <img src={currentImage} alt="Scene" className="game-scene-image" />
        )}
        <div className={`cinematic-text-overlay ${overlayVisible ? 'visible' : ''}`}>
          <p>
            <Typewriter 
              text={currentSentence} 
              isActive={overlayVisible} 
              duration={currentSentence.length * 40}
            />
          </p>
          <div className="click-hint">{t('click_to_advance') || "Click to advance"}</div>
        </div>
      </div>

      <div className="spinner" style={{ display: isProcessing && !currentImage ? 'block' : 'none' }}>
        {t('loadingText')}
      </div>

      <div id="options" className={areOptionsVisible && !isProcessing ? "fade-in-up" : ""} style={{ display: (areOptionsVisible && !isProcessing) ? 'flex' : 'none' }}>
        <p className="choose-instruction fade-in-delayed">{t("choose_option")}</p>
        <button ref={option1} onClick={() => sendChoice(1)} disabled={!currentOptions[0]}>{currentOptions[0] || "Option 1"}</button>
        <button ref={option2} onClick={() => sendChoice(2)} disabled={!currentOptions[1]}>{currentOptions[1] || "Option 2"}</button>
        <button ref={option3} onClick={() => sendChoice(3)} disabled={!currentOptions[2]}>{currentOptions[2] || "Option 3"}</button>
      </div>

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
