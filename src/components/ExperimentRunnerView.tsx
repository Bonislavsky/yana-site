/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  FileSpreadsheet, 
  BookOpen, 
  Timer, 
  Award,
  BarChart3,
  Sparkles
} from 'lucide-react';
import { soundEngine } from '../utils/audioEngine';
import { CognitiveTrial, ExperimentResult, SoundCondition } from '../types';

export const ExperimentRunnerView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'live_test' | 'protocols' | 'methodology'>('live_test');

  // Live Experiment State
  const [experimentStep, setExperimentStep] = useState<'intro' | 'testing' | 'summary'>('intro');
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [currentTrialIdx, setCurrentTrialIdx] = useState(0);
  const [trialStartTime, setTrialStartTime] = useState(0);
  const [results, setResults] = useState<ExperimentResult[]>([]);

  // Round sound conditions
  const testConditions: { id: SoundCondition['id']; name: string; db: number }[] = [
    { id: 'silence', name: '1. Контрольна умова: Тиша (30 дБА)', db: 30 },
    { id: 'speech', name: '2. Експериментальна умова: Мовний шум (65 дБА)', db: 65 },
    { id: 'pink_noise', name: '3. Експериментальна умова: Рожевий шум (50 дБА)', db: 50 },
  ];

  // Stroop stimulus pool
  const colorOptions = [
    { key: 'red', label: 'Червоний', colorClass: 'text-rose-500', bgClass: 'bg-rose-500/10 border-rose-500/40 text-rose-300' },
    { key: 'blue', label: 'Синій', colorClass: 'text-sky-500', bgClass: 'bg-sky-500/10 border-sky-500/40 text-sky-300' },
    { key: 'green', label: 'Зелений', colorClass: 'text-emerald-500', bgClass: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' },
    { key: 'amber', label: 'Жовтий', colorClass: 'text-amber-400', bgClass: 'bg-amber-500/10 border-amber-500/40 text-amber-300' },
  ];

  // 6 trials per round
  const trialsPerRound = 6;
  const generateTrials = (): CognitiveTrial[] => {
    const list: CognitiveTrial[] = [];
    for (let i = 0; i < trialsPerRound; i++) {
      const textItem = colorOptions[Math.floor(Math.random() * colorOptions.length)];
      // 70% incongruent (conflict)
      const isIncongruent = Math.random() < 0.7;
      let fontColorItem = textItem;
      if (isIncongruent) {
        const others = colorOptions.filter((c) => c.key !== textItem.key);
        fontColorItem = others[Math.floor(Math.random() * others.length)];
      }
      list.push({
        id: i,
        text: textItem.label,
        color: fontColorItem.colorClass,
        correctColorKey: fontColorItem.key,
        isCongruent: !isIncongruent,
      });
    }
    return list;
  };

  const [currentRoundTrials, setCurrentRoundTrials] = useState<CognitiveTrial[]>([]);
  const [currentRoundTimes, setCurrentRoundTimes] = useState<number[]>([]);
  const [currentRoundCorrect, setCurrentRoundCorrect] = useState(0);

  // Stop sound on unmount
  useEffect(() => {
    return () => {
      soundEngine.stopAmbient();
    };
  }, []);

  const startExperiment = () => {
    setResults([]);
    setCurrentRoundIdx(0);
    startRound(0);
  };

  const startRound = (roundIdx: number) => {
    const condition = testConditions[roundIdx];
    soundEngine.playAmbient(condition.id, 1.0);

    const newTrials = generateTrials();
    setCurrentRoundTrials(newTrials);
    setCurrentTrialIdx(0);
    setCurrentRoundTimes([]);
    setCurrentRoundCorrect(0);
    setExperimentStep('testing');
    setTrialStartTime(Date.now());
  };

  const handleColorChoice = (selectedColorKey: string) => {
    const elapsed = Date.now() - trialStartTime;
    const currentTrial = currentRoundTrials[currentTrialIdx];
    const isCorrect = selectedColorKey === currentTrial.correctColorKey;

    const newTimes = [...currentRoundTimes, elapsed];
    const newCorrect = currentRoundCorrect + (isCorrect ? 1 : 0);

    setCurrentRoundTimes(newTimes);
    if (isCorrect) setCurrentRoundCorrect(newCorrect);

    if (currentTrialIdx + 1 < trialsPerRound) {
      // Next trial
      setCurrentTrialIdx((prev) => prev + 1);
      setTrialStartTime(Date.now());
    } else {
      // Round completed
      const avgRt = Math.round(newTimes.reduce((a, b) => a + b, 0) / newTimes.length);
      const acc = Math.round((newCorrect / trialsPerRound) * 100);
      const condition = testConditions[currentRoundIdx];

      const roundResult: ExperimentResult = {
        condition: condition.id,
        conditionName: condition.name,
        avgReactionTimeMs: avgRt,
        accuracyPercent: acc,
        totalTrials: trialsPerRound,
        correctTrials: newCorrect,
      };

      const updatedResults = [...results, roundResult];
      setResults(updatedResults);

      if (currentRoundIdx + 1 < testConditions.length) {
        // Next condition
        const nextRound = currentRoundIdx + 1;
        setCurrentRoundIdx(nextRound);
        startRound(nextRound);
      } else {
        // All finished!
        soundEngine.stopAmbient();
        setExperimentStep('summary');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Title Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="text-xs font-semibold text-emerald-400 mb-1">
          Ключове питання №3 · Методологія емпіричного дослідження
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
          Проєктування та проведення дослідження впливу звуку на навчання
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          Справжня когнітивна лабораторія: пройдіть інтерактивний експеримент Струпа під трьома різними звуковими фонами або скористайтеся готовими протоколами для власного наукового проєкту.
        </p>

        {/* Section Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-5">
          <button
            onClick={() => setActiveTab('live_test')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium border cursor-pointer transition-colors ${
              activeTab === 'live_test'
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-semibold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            1. Інтерактивний тест Струпа в реальному часі
          </button>

          <button
            onClick={() => setActiveTab('protocols')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium border cursor-pointer transition-colors ${
              activeTab === 'protocols'
                ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300 font-semibold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            2. Три готові прикладні протоколи досліджень
          </button>

          <button
            onClick={() => setActiveTab('methodology')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium border cursor-pointer transition-colors ${
              activeTab === 'methodology'
                ? 'bg-purple-500/10 border-purple-500/40 text-purple-300 font-semibold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            3. Науковий апарат: змінні, латинський квадрат та ANOVA
          </button>
        </div>
      </div>

      {/* TAB 1: LIVE EXPERIMENT */}
      {activeTab === 'live_test' && (
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-6">
          {experimentStep === 'intro' && (
            <div className="max-w-3xl space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Timer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100">
                    Експрес-експеримент: Селективна увага під впливом трьох звукових умов
                  </h3>
                  <p className="text-xs text-slate-400">
                    Тривалість тесту: ~45 секунд (по 6 стимулів на кожен із трьох звукових режимів).
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-3 text-xs text-slate-300 leading-relaxed">
                <div className="font-semibold text-emerald-300">
                  Інструкція для досліджуваного:
                </div>
                <p>
                  1. На екрані з’являтиметься слово, надруковане певним кольором (наприклад, слово «СИНІЙ», надруковане червоним шрифтом).
                </p>
                <p>
                  2. Ваше завдання — якнайшвидше натиснути кнопку, що відповідає <span className="text-emerald-400 font-bold">КОЛЬОРУ ШРИФТУ</span>, повністю ігноруючи те, що написано текстом.
                </p>
                <p>
                  3. Тест складатиметься з трьох раундів із автоматичною зміною фонового аудіо:
                  <br />
                  • <span className="font-semibold text-slate-200">Раунд 1:</span> Абсолютна тиша (контроль).
                  <br />
                  • <span className="font-semibold text-rose-300">Раунд 2:</span> Мовний шум / розмови класу (ефект стороннього мовлення).
                  <br />
                  • <span className="font-semibold text-sky-300">Раунд 3:</span> Рожевий шум (маскування).
                </p>
              </div>

              <button
                onClick={startExperiment}
                className="px-6 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-sm flex items-center gap-2 cursor-pointer transition-colors shadow-lg shadow-emerald-950/40"
              >
                <Play className="w-4 h-4 fill-current" />
                Розпочати наукове тестування
              </button>
            </div>
          )}

          {experimentStep === 'testing' && currentRoundTrials.length > 0 && (
            <div className="space-y-6">
              {/* Round condition badge & Progress */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-slate-200">
                    {testConditions[currentRoundIdx].name}
                  </span>
                </div>
                <div className="text-xs font-mono text-cyan-400">
                  Стимул {currentTrialIdx + 1} з {trialsPerRound}
                </div>
              </div>

              {/* Main Stimulus Card */}
              <div className="h-64 rounded-2xl border border-slate-700/80 bg-slate-950 flex flex-col items-center justify-center p-8 text-center shadow-inner relative overflow-hidden">
                <div className="text-xs text-slate-500 mb-4 select-none">
                  Яким кольором написане це слово? (Швидко натисніть кнопку нижче)
                </div>

                <div
                  className={`text-5xl sm:text-6xl font-black tracking-wider transition-transform duration-150 select-none ${
                    currentRoundTrials[currentTrialIdx].color
                  }`}
                >
                  {currentRoundTrials[currentTrialIdx].text}
                </div>
              </div>

              {/* Answer Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {colorOptions.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => handleColorChoice(opt.key)}
                    className={`p-4 rounded-xl border text-sm font-bold transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${opt.bgClass}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {experimentStep === 'summary' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-100">
                      Результати експерименту: Порівняльний аналіз умов
                    </h3>
                    <p className="text-xs text-slate-400">
                      Дані зафіксовані в режимі реального часу.
                    </p>
                  </div>
                </div>

                <button
                  onClick={startExperiment}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Пройти тест повторно
                </button>
              </div>

              {/* Comparative Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {results.map((res, rIdx) => (
                  <div
                    key={rIdx}
                    className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-3"
                  >
                    <div className="text-xs font-semibold text-slate-400">
                      {res.conditionName}
                    </div>

                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-400">Сер. час реакції:</span>
                      <span className="text-xl font-mono font-bold text-cyan-400">
                        {res.avgReactionTimeMs} мс
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-400">Точність відповідей:</span>
                      <span className={`text-base font-mono font-bold ${
                        res.accuracyPercent >= 90 ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {res.accuracyPercent}% ({res.correctTrials}/{res.totalTrials})
                      </span>
                    </div>

                    {/* Progress visual bar */}
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 rounded-full"
                        style={{ width: `${Math.min(100, (res.avgReactionTimeMs / 1200) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Scientific interpretation box */}
              <div className="p-5 rounded-xl border border-cyan-500/30 bg-cyan-950/20 space-y-3">
                <div className="text-xs font-bold text-cyan-300 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  Автоматичний науковий висновок за вашими даними:
                </div>
                {results.length >= 2 && (
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {results[1].avgReactionTimeMs > results[0].avgReactionTimeMs ? (
                      <>
                        <span className="font-semibold text-rose-300">Підтверджено ефект стороннього мовлення: </span>
                        Під час прослуховування мовного шуму середній час реакції збільшився на{' '}
                        <span className="font-mono font-bold text-amber-300">
                          {results[1].avgReactionTimeMs - results[0].avgReactionTimeMs} мс
                        </span>{' '}
                        (інтерференція фонологічної петлі). Мозок витрачав додаткові ресурси на пригнічення семантичного сигналу фону.
                      </>
                    ) : (
                      <>
                        Швидкість реакції під час мовного шуму збереглася на високому рівні (компенсаторна активація префронтальної кори).
                      </>
                    )}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: THREE CONCRETE PROTOCOLS */}
      {activeTab === 'protocols' && (
        <div className="space-y-6">
          {/* Protocol 1 */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-800/40">
                ПРОТОКОЛ ДОСЛІДЖЕННЯ №1
              </span>
              <span className="text-xs text-slate-400">Рівень: 8–11 класи шкіл та студенти ВНЗ</span>
            </div>

            <h3 className="text-lg font-bold text-slate-100">
              «Вплив мовного шуму на селективну увагу та читання складного тексту»
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-bold text-cyan-300 block">Гіпотеза дослідження:</span>
                <p className="text-slate-300 leading-relaxed">
                  Фонове мовлення українською мовою (65 дБА) призведе до вірогідного зростання кількості помилок під час читання та зниження фактологічного відтворення на понад 25% порівняно з тишею (30 дБА).
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-bold text-emerald-300 block">План вибірки та стимулів:</span>
                <p className="text-slate-300 leading-relaxed">
                  30 респондентів. 3 науково-популярні тексти однакової довжини (400 слів) та індексу Flesch-Kincaid. 10 тестових запитань із вибором відповідей після кожного тексту.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <span className="font-bold text-amber-300 block">Покрокова процедура:</span>
              <ol className="list-decimal list-inside space-y-1 text-slate-300">
                <li>Шумомір розміщується на рівні вух респондента (1.2 м від підлоги).</li>
                <li>Респондент у навушниках відкритого типу читає текст 1 у тиші (5 хв).</li>
                <li>Пауза 3 хв, виконання відволікаючого просторового завдання.</li>
                <li>Читання тексту 2 під запис розмовного шуму (65 дБА) з подальшим тестуванням.</li>
                <li>Статистичний аналіз за парним t-критерієм Стьюдента.</li>
              </ol>
            </div>
          </div>

          {/* Protocol 2 */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono text-purple-400 bg-purple-950/60 px-2.5 py-1 rounded border border-purple-800/40">
                ПРОТОКОЛ ДОСЛІДЖЕННЯ №2
              </span>
              <span className="text-xs text-slate-400">Рівень: Студентські курсові та дипломні роботи</span>
            </div>

            <h3 className="text-lg font-bold text-slate-100">
              «Інструментальна класична музика (бароко 60 bpm) проти пісні з текстом при розв’язанні стереометричних задач»
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-bold text-purple-300 block">Мета та механізм:</span>
                <p className="text-slate-300 leading-relaxed">
                  З’ясувати, чи не виникає подвійного навантаження, коли просторове мислення (візуально-просторовий блокнот) супроводжується ритмічним звуком без слів проти пісні зі словами.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-bold text-emerald-300 block">Очікуваний результат:</span>
                <p className="text-slate-300 leading-relaxed">
                  Барокова музика зберігає темп виконання геометрії або підвищує його на 8–12% завдяки тонусу ритму, тоді як текстова пісня знижує продуктивність через постійну перевірку слів семантичною пам’яттю.
                </p>
              </div>
            </div>
          </div>

          {/* Protocol 3 */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded border border-amber-800/40">
                ПРОТОКОЛ ДОСЛІДЖЕННЯ №3
              </span>
              <span className="text-xs text-slate-400">Рівень: Архітектурно-педагогічний експеримент</span>
            </div>

            <h3 className="text-lg font-bold text-slate-100">
              «Час реверберації аудиторії (RT60) та швидкість виконання усних математичних операцій»
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-bold text-amber-300 block">Акустичні параметри:</span>
                <p className="text-slate-300 leading-relaxed">
                  Порівняння двох реальних класів: 1) Клас без звукопоглинання (бетонні стіни, скло, RT60 = 1.4 с); 2) Клас з перфорованими акустичними панелями та шторами (RT60 = 0.5 с).
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-bold text-emerald-300 block">Фіксація результатів:</span>
                <p className="text-slate-300 leading-relaxed">
                  У гулкому класі коефіцієнт розбірливості мови (STI) падає нижче 0.6, що змушує учнів постійно перепитувати вчителя; кількість обчислювальних помилок зростає на 42%.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: METHODOLOGY, VARIABLES & LATIN SQUARE */}
      {activeTab === 'methodology' && (
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-100">
              Науковий методологічний апарат експерименту
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Класифікація змінних, схема латинського квадрата та математична модель дисперсійного аналізу.
            </p>
          </div>

          {/* Variables Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20 space-y-2">
              <div className="font-bold text-cyan-300">1. Незалежна змінна (IV)</div>
              <p className="text-slate-300 leading-relaxed">
                Параметр, яким керує експериментатор: тип звукового фону (Тиша 30 дБ, Рожевий шум 50 дБ, Мова 65 дБ, Музика 55 дБ).
              </p>
            </div>

            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 space-y-2">
              <div className="font-bold text-emerald-300">2. Залежні змінні (DV)</div>
              <p className="text-slate-300 leading-relaxed">
                Показники, що вимірюються: час реакції (RT у мс), процент помилок (% помилок), суб’єктивна втома за шкалою NASA-TLX.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20 space-y-2">
              <div className="font-bold text-amber-300">3. Контрольовані змінні (CV)</div>
              <p className="text-slate-300 leading-relaxed">
                Фактори, які тримаються сталими: однакове освітлення (500 люкс), температура (20 °C), відсутність візуальних дистракторів.
              </p>
            </div>
          </div>

          {/* Latin Square balancing table */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-3">
            <h4 className="text-xs font-bold text-slate-200">
              Схема контрбалансування Латинського квадрата 4×4:
            </h4>
            <p className="text-xs text-slate-400">
              Усуває артефакт тренування (learning effect), коли кожен наступний тест здається легшим.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono">
                    <th className="py-2 px-3">Група</th>
                    <th className="py-2 px-3">Блок 1</th>
                    <th className="py-2 px-3">Блок 2</th>
                    <th className="py-2 px-3">Блок 3</th>
                    <th className="py-2 px-3">Блок 4</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                  <tr>
                    <td className="py-2 px-3 font-bold text-cyan-400">Група 1</td>
                    <td className="py-2 px-3">A (Тиша)</td>
                    <td className="py-2 px-3">B (Мова)</td>
                    <td className="py-2 px-3">C (Рожевий шум)</td>
                    <td className="py-2 px-3">D (Музика)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-cyan-400">Група 2</td>
                    <td className="py-2 px-3">B (Мова)</td>
                    <td className="py-2 px-3">D (Музика)</td>
                    <td className="py-2 px-3">A (Тиша)</td>
                    <td className="py-2 px-3">C (Рожевий шум)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-cyan-400">Група 3</td>
                    <td className="py-2 px-3">C (Рожевий шум)</td>
                    <td className="py-2 px-3">A (Тиша)</td>
                    <td className="py-2 px-3">D (Музика)</td>
                    <td className="py-2 px-3">B (Мова)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-cyan-400">Група 4</td>
                    <td className="py-2 px-3">D (Музика)</td>
                    <td className="py-2 px-3">C (Рожевий шум)</td>
                    <td className="py-2 px-3">B (Мова)</td>
                    <td className="py-2 px-3">A (Тиша)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
