/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type NavigationTab = 
  | 'presentation'
  | 'acoustic_lab'
  | 'psychoacoustics'
  | 'experiment'
  | 'report';

export interface SlideData {
  id: number;
  category: 'Вступ' | 'Питання 1: Фізика' | 'Питання 2: Психоакустика' | 'Питання 3: Експеримент' | 'Висновки';
  questionNumber?: 1 | 2 | 3;
  title: string;
  subtitle: string;
  keyPoints: {
    title: string;
    description: string;
    formula?: string;
  }[];
  speakerNotes: string; // Speech text for the presenter
  durationMin: number;
  imagePath?: string;
  diagramType?: 'acoustic_wave' | 'harmonics' | 'baddeley_model' | 'yerkes_dodson' | 'experiment_design' | 'noise_spectra' | 'decibel_scale';
}

export interface CognitiveTrial {
  id: number;
  text: string;
  color: string; // Display color
  correctColorKey: string;
  isCongruent: boolean;
}

export interface SoundCondition {
  id: 'silence' | 'pink_noise' | 'speech' | 'ambient';
  label: string;
  dbLevel: number;
  description: string;
  cognitiveEffect: string;
}

export interface ExperimentResult {
  condition: SoundCondition['id'];
  conditionName: string;
  avgReactionTimeMs: number;
  accuracyPercent: number;
  totalTrials: number;
  correctTrials: number;
}

export interface ResearchTemplate {
  id: string;
  title: string;
  gradeLevel: string;
  object: string;
  subject: string;
  hypothesis: string;
  nullHypothesis: string;
  independentVar: string;
  dependentVar: string;
  controlVars: string[];
  designType: string;
  taskDescription: string;
  procedureSteps: string[];
  expectedResult: string;
}
