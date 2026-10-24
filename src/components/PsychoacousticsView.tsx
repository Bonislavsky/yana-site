/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Volume2, 
  Activity, 
  Sparkles, 
  Square, 
  Play, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  ShieldAlert
} from 'lucide-react';
import { soundEngine } from '../utils/audioEngine';
import { SoundCondition } from '../types';

export const PsychoacousticsView: React.FC = () => {
  const [activeSoundEnv, setActiveSoundEnv] = useState<SoundCondition['id']>('silence');
  const [taskComplexity, setTaskComplexity] = useState<'simple' | 'complex'>('complex');
  const [activeBaddeleyNode, setActiveBaddeleyNode] = useState<string>('phonological_loop');

  const soundEnvironments: SoundCondition[] = [
    {
      id: 'silence',
      label: 'Абсолютна тиша (Аудиторія відпочинку)',
      dbLevel: 30,
      description: 'Відсутність зовнішніх акустичних подразників. Еталонне середовище для складного синтезу інформації.',
      cognitiveEffect: 'Мінімальне когнітивне навантаження. Повний ресурс фонологічної петлі спрямовано на навчальний текст.',
    },
    {
      id: 'pink_noise',
      label: 'Рожевий шум (Маскувальний спектр 1/f)',
      dbLevel: 50,
      description: 'Рівномірний спад енергії 3 дБ на октаву. Природно згладжує раптові різкі акустичні спалахи.',
      cognitiveEffect: 'Знижує реакцію на раптові дистрактори (рипіння дверей, кроки). Стохастичний резонанс допомагає при СДУГ.',
    },
    {
      id: 'ambient',
      label: 'Інструментальний ембієнт (Lo-Fi без слів)',
      dbLevel: 55,
      description: 'М’яка гармонійна послідовність акордів у темпі 60–70 bpm (ефект барокової музики).',
      cognitiveEffect: 'Підтримує стабільний тонус кори без завантаження семантичної пам’яті, оскільки відсутні вербальні слова.',
    },
    {
      id: 'speech',
      label: 'Стороннє мовлення (Шум класу / Розмови)',
      dbLevel: 65,
      description: 'Нерозбірливі та напіврозбірливі уривки розмов однокласників чи колег у діапазоні 1–4 кГц.',
      cognitiveEffect: 'Критична інтерференція (ISE). Почуті слова блокують субвокалізацію, знижуючи точність читання на 30–50%!',
    },
  ];

  // Stop sound on unmount
  useEffect(() => {
    return () => {
      soundEngine.stopAmbient();
    };
  }, []);

  const handleSelectSound = (id: SoundCondition['id']) => {
    if (activeSoundEnv === id && id !== 'silence') {
      soundEngine.stopAmbient();
      setActiveSoundEnv('silence');
    } else {
      setActiveSoundEnv(id);
      soundEngine.playAmbient(id, 1.0);
    }
  };

  const currentEnv = soundEnvironments.find((e) => e.id === activeSoundEnv) || soundEnvironments[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Title Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="text-xs font-semibold text-sky-400 mb-1">
          Ключове питання №2 · Психофізика, когнітивні моделі та увага
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
          Слухове сприймання, увага та умови звукового середовища
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          Як фізичні коливання повітря трансформуються в нейронні сигнали, чому людська мова паралізує читання підручника і як спектральні типи шумів впливають на успішність навчання.
        </p>
      </div>

      {/* Module 1: Live Auditory Environment Simulator */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-sky-400" />
              1. Симулятор акустичних режимів освітнього середовища
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Увімкніть різний аудіофон, щоб на власному досвіді відчути когнітивне навантаження.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400">Рівень звукового тиску:</span>
            <span className={`text-base font-mono font-bold ${
              currentEnv.dbLevel <= 40 ? 'text-emerald-400' :
              currentEnv.dbLevel <= 55 ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {currentEnv.dbLevel} дБА
            </span>
          </div>
        </div>

        {/* 4 Environment cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {soundEnvironments.map((env) => {
            const isPlaying = activeSoundEnv === env.id;
            return (
              <button
                key={env.id}
                onClick={() => handleSelectSound(env.id)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isPlaying
                    ? 'border-sky-400 bg-sky-950/40 shadow-md shadow-sky-950/50'
                    : 'border-slate-800 bg-slate-950/60 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-semibold text-sky-300">
                      {env.dbLevel} дБА
                    </span>
                    <span className={`p-1 rounded-full ${
                      isPlaying ? 'bg-sky-500/20 text-sky-300' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {isPlaying ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-100 mb-1 leading-snug">
                    {env.label}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {env.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] font-medium text-slate-300 flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    isPlaying ? 'bg-sky-400 animate-pulse' : 'bg-slate-600'
                  }`} />
                  {isPlaying ? 'Відтворюється зараз' : 'Увімкнути для перевірки'}
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic feedback panel on active sound */}
        <div className={`p-4 rounded-xl border text-xs leading-relaxed flex items-start gap-3 ${
          activeSoundEnv === 'speech' 
            ? 'bg-rose-950/30 border-rose-900/60 text-rose-200' 
            : activeSoundEnv === 'silence'
            ? 'bg-emerald-950/30 border-emerald-900/60 text-emerald-200'
            : 'bg-slate-950 border-slate-800 text-slate-300'
        }`}>
          {activeSoundEnv === 'speech' ? (
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          ) : activeSoundEnv === 'silence' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
          )}
          <div>
            <span className="font-bold block mb-0.5">
              Когнітивний ефект поточного фону ({currentEnv.label}):
            </span>
            {currentEnv.cognitiveEffect}
          </div>
        </div>
      </div>

      {/* Module 2: Interactive Working Memory Model (Alan Baddeley) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 cols: Interactive Baddeley Architecture */}
        <div className="lg:col-span-7 p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-5">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Brain className="w-5 h-5 text-cyan-400" />
              2. Модель робочої пам’яті Бадделі та ефект стороннього мовлення (ISE)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Натисніть на компоненти моделі, щоб побачити шлях інформаційного конфлікту.
            </p>
          </div>

          {/* Central Executive */}
          <div
            onClick={() => setActiveBaddeleyNode('central_executive')}
            className={`p-4 rounded-xl border text-center cursor-pointer transition-all ${
              activeBaddeleyNode === 'central_executive'
                ? 'bg-amber-500/15 border-amber-400 text-amber-200 shadow-md'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="text-xs font-mono text-amber-400 font-bold mb-0.5">
              КЕРУЮЧИЙ БЛОК
            </div>
            <div className="text-base font-bold">Центральний виконавець (Central Executive)</div>
            <div className="text-xs text-slate-400 mt-1">
              Розподіл селективної уваги, пригнічення нерелевантних стимулів, планування дій
            </div>
          </div>

          {/* Connecting Arrows */}
          <div className="flex justify-around text-slate-600 text-lg">
            <span>↓</span>
            <span>↓</span>
            <span>↓</span>
          </div>

          {/* 3 Sub-systems Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Visual-spatial */}
            <div
              onClick={() => setActiveBaddeleyNode('visuospatial')}
              className={`p-3.5 rounded-xl border text-center cursor-pointer transition-all ${
                activeBaddeleyNode === 'visuospatial'
                  ? 'bg-sky-500/15 border-sky-400 text-sky-200 shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="text-[10px] font-mono text-sky-400 font-bold mb-0.5">ВІЗУАЛЬНЕ</div>
              <div className="text-xs font-bold text-slate-200">Візуально-просторовий блокнот</div>
              <div className="text-[11px] text-slate-400 mt-1">
                Геометрія, просторові карти, графіки
              </div>
            </div>

            {/* Episodic Buffer */}
            <div
              onClick={() => setActiveBaddeleyNode('episodic')}
              className={`p-3.5 rounded-xl border text-center cursor-pointer transition-all ${
                activeBaddeleyNode === 'episodic'
                  ? 'bg-purple-500/15 border-purple-400 text-purple-200 shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="text-[10px] font-mono text-purple-400 font-bold mb-0.5">ІНТЕГРАЦІЯ</div>
              <div className="text-xs font-bold text-slate-200">Епізодичний буфер</div>
              <div className="text-[11px] text-slate-400 mt-1">
                Об’єднання зору, слуху та довготривалої пам’яті
              </div>
            </div>

            {/* Phonological Loop (Crucial for reading/sound) */}
            <div
              onClick={() => setActiveBaddeleyNode('phonological_loop')}
              className={`p-3.5 rounded-xl border text-center cursor-pointer transition-all ${
                activeBaddeleyNode === 'phonological_loop'
                  ? 'bg-rose-500/20 border-rose-400 text-rose-200 shadow-md ring-1 ring-rose-400/40'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="text-[10px] font-mono text-rose-400 font-bold mb-0.5">ВРАЗЛИВА ЗОНА</div>
              <div className="text-xs font-bold text-rose-300">Фонологічна петля</div>
              <div className="text-[11px] text-slate-300 mt-1">
                Сховище звуків мови + внутрішня субвокалізація
              </div>
            </div>
          </div>

          {/* Sub-components of Phonological Loop */}
          <div className="p-4 rounded-xl border border-rose-900/50 bg-rose-950/20 space-y-3">
            <div className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Механізм когнітивної інтерференції у фонологічній петлі:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="font-semibold text-amber-300 block mb-1">
                  1. Пасивне фонологічне сховище:
                </span>
                Утримує звуки мови всього 1.5–2 секунди. Будь-який сторонній голос або шепіт у класі проникає сюди автоматично, незалежно від бажання учня.
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="font-semibold text-cyan-300 block mb-1">
                  2. Артикуляційний контур (Субвокалізація):
                </span>
                Внутрішній голос, яким учень проговорює текст під час читання. Стороннє мовлення викликає пряме накладання і перезапис інформації!
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 cols: Node Details and Neurobiology */}
        <div className="lg:col-span-5 space-y-5">
          {/* Scientific Illustration */}
          <div className="rounded-xl overflow-hidden border border-slate-800 shadow-lg bg-slate-950">
            <img
              src="/src/assets/images/auditory_attention_brain_1792863214387.jpg"
              alt="Слухове сприйняття та увага"
              referrerPolicy="no-referrer"
              className="w-full h-56 object-cover object-center"
            />
            <div className="p-3 text-xs text-slate-300 bg-slate-900/90 border-t border-slate-800">
              <span className="font-semibold text-cyan-300">Кортикальний шлях: </span>
              Завитка внутрішнього вуха → Таламус (медіальне колінчасте тіло) → Первинна слухова кора (гірус Гешля) → Префронтальна кора (селективний фільтр).
            </div>
          </div>

          {/* Node detailed description */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-2">
            <div className="text-xs font-bold text-slate-200">
              Чому музика без слів шкодить менше, ніж мова?
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Мозок людини володіє спеціалізованими мовними центрами (зони Брока і Верніке). Коли звучить мелодія без слів (Lo-Fi, Бах, Шопен), вона обробляється переважно правою півкулею як гармонійний патерн. Але щойно в пісні з’являються слова знайомою мовою, активується ліва скронева частка, що миттєво конкурує з навчальним текстом за фонологічну петлю.
            </p>
          </div>
        </div>
      </div>

      {/* Module 3: Yerkes-Dodson Law Simulator */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-400" />
              3. Закон оптимуму активації Єркса-Додсона в акустиці
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Як складність навчального завдання зміщує точку оптимального звукового рівня.
            </p>
          </div>

          {/* Task complexity toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
            <button
              onClick={() => setTaskComplexity('simple')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                taskComplexity === 'simple'
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Просте рутинне завдання
            </button>
            <button
              onClick={() => setTaskComplexity('complex')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                taskComplexity === 'complex'
                  ? 'bg-cyan-400 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Складне аналітичне завдання
            </button>
          </div>
        </div>

        {/* Yerkes-Dodson visual graph */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
            <div className="text-xs font-mono text-slate-400">ЗОНА 1: НЕДОАКТИВАЦІЯ</div>
            <div className="text-sm font-bold text-slate-200">Низький шум (&lt; 25 дБ)</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {taskComplexity === 'simple'
                ? 'При монотонній праці викликає сонливість, зниження пильності та темпу роботи.'
                : 'Ідеальні умови для глибокого міркування, аналізу формул та написання авторських есе.'}
            </p>
          </div>

          <div className={`p-4 rounded-xl border space-y-2 ${
            taskComplexity === 'simple'
              ? 'border-amber-400/60 bg-amber-950/20'
              : 'border-cyan-400/60 bg-cyan-950/20'
          }`}>
            <div className="text-xs font-mono text-emerald-400 font-bold">ЗОНА 2: ОПТИМУМ</div>
            <div className="text-sm font-bold text-slate-100">
              {taskComplexity === 'simple' ? 'Помірний звук (50–60 дБ)' : 'Тиша або рожевий шум (35–45 дБ)'}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {taskComplexity === 'simple'
                ? 'Ритмічна музика тримає моторний тонус ЦНС на піку без втрати швидкості.'
                : 'Оптимум активації кори. Мінімальна ймовірність помилок у логічних ланцюжках.'}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-rose-900/60 bg-rose-950/20 space-y-2">
            <div className="text-xs font-mono text-rose-400">ЗОНА 3: ДИСТРАКЦІЯ ТА СТРЕС</div>
            <div className="text-sm font-bold text-slate-200">Високий шум (&gt; 65 дБ)</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Падіння продуктивності за будь-якого завдання. Викид гормонів стресу (кортизол), швидке настання слухової втоми.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
