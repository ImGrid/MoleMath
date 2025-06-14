export interface Element {
  readonly symbol: string;
  readonly name: string;
  readonly number: number;
  readonly atomic_mass: number;
  readonly group?: number;
  readonly period?: number;
}

export type ElementMap = Record<string, Element>;

export interface ParsedElement {
  readonly symbol: string;
  readonly count: number;
}

export interface ParsedFormula {
  readonly elements: readonly ParsedElement[];
  readonly formula: string;
  readonly isValid: boolean;
  readonly error?: string;
}

export type PhysicalState = 'solid' | 'liquid' | 'gas' | 'aqueous' | 'plasma';

export type CompoundType = 'ionic' | 'molecular' | 'network' | 'metallic';

export interface ChemicalCompound {
  readonly name: string;
  readonly formula: string;
  readonly type: CompoundType;
  readonly state: PhysicalState;
  readonly commonName?: string;
  readonly category?: string;
}

export interface ElementContribution {
  readonly symbol: string;
  readonly name: string;
  readonly count: number;
  readonly atomicMass: number;
  readonly contribution: number;
  readonly massPercent: number; 
}

export interface MolarMassResult {
  readonly formula: string;
  readonly elements: readonly ElementContribution[];
  readonly molarMass: number;
  readonly steps: readonly CalculationStep[];
  readonly isValid: boolean;
  readonly error?: string;
}

export type ConversionType = 
  | 'grams-to-moles'
  | 'moles-to-grams'
  | 'moles-to-molecules'
  | 'molecules-to-moles'
  | 'grams-to-molecules'
  | 'molecules-to-grams';


export interface ConversionResult {
  readonly type: ConversionType;
  readonly inputValue: number;
  readonly inputUnit: string;
  readonly outputValue: number;
  readonly outputUnit: string;
  readonly compound: string;
  readonly steps: readonly CalculationStep[];
  readonly isValid: boolean;
  readonly error?: string;
}

export type ConcentrationType = 'molarity' | 'molality';


export interface ConcentrationInput {
  readonly soluteMass: number;
  readonly soluteFormula: string;
  readonly solutionVolume?: number;
  readonly solventMass?: number;
}


export interface ConcentrationResult {
  readonly type: ConcentrationType;
  readonly concentration: number;
  readonly unit: string;
  readonly solute: string;
  readonly steps: readonly CalculationStep[];
  readonly isValid: boolean;
  readonly error?: string;
}


export interface DilutionInput {
  readonly initialConcentration?: number;
  readonly initialVolume?: number;
  readonly finalConcentration?: number;
  readonly finalVolume?: number;
}

export interface DilutionResult {
  readonly volumeNeeded: number;
  readonly solventToAdd: number;
  readonly steps: readonly CalculationStep[];
  readonly isValid: boolean;
  readonly error?: string;
}

export interface EquationCompound {
  readonly formula: string;
  readonly coefficient: number;
}

export interface ChemicalEquation {
  readonly reactants: readonly EquationCompound[];
  readonly products: readonly EquationCompound[];
}

export interface BalanceResult {
  readonly originalEquation: ChemicalEquation;
  readonly balancedReactants: readonly EquationCompound[];
  readonly balancedProducts: readonly EquationCompound[];
  readonly balancedEquation: string;
  readonly method: BalanceMethod;
  readonly steps: readonly BalanceStep[];
  readonly isValid: boolean;
  readonly error?: string;
}

export type BalanceMethod = 'trial-and-error' | 'algebraic';

export interface BalanceStep {
  readonly stepNumber: number;
  readonly description: string;
  readonly equation: string;
  readonly elementCount?: Record<string, { left: number; right: number }>;
}

export interface CalculationStep {
  readonly step: number;
  readonly description: string;
  readonly operation?: string;
  readonly result?: number;
  readonly unit?: string;
}

export interface ChemistryError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly timestamp: Date;
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
export interface ValueWithUnit {
  readonly value: number;
  readonly unit: string;
}

export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
  readonly warnings?: readonly string[];
}

export interface MolarMassInput {
  readonly formula: string;
}

export interface ConversionInput {
  readonly value: number;
  readonly conversionType: ConversionType;
  readonly formula: string;
}

export interface BalanceInput {
  readonly equation: string;
  readonly method?: BalanceMethod;
}

export type ElementTypes = {
  Element: Element;
  ElementMap: ElementMap;
};

export type ParsingTypes = {
  ParsedElement: ParsedElement;
  ParsedFormula: ParsedFormula;
  ChemicalCompound: ChemicalCompound;
  CompoundType: CompoundType;
  PhysicalState: PhysicalState;
};

export type MolarMassTypes = {
  MolarMassInput: MolarMassInput;
  MolarMassResult: MolarMassResult;
  ElementContribution: ElementContribution;
  ConversionInput: ConversionInput;
  ConversionResult: ConversionResult;
  ConversionType: ConversionType;
};

export type ConcentrationTypes = {
  ConcentrationType: ConcentrationType;
  ConcentrationInput: ConcentrationInput;
  ConcentrationResult: ConcentrationResult;
  DilutionInput: DilutionInput;
  DilutionResult: DilutionResult;
};

export type BalanceTypes = {
  ChemicalEquation: ChemicalEquation;
  EquationCompound: EquationCompound;
  BalanceInput: BalanceInput;
  BalanceResult: BalanceResult;
  BalanceMethod: BalanceMethod;
  BalanceStep: BalanceStep;
};

export type CommonTypes = {
  CalculationStep: CalculationStep;
  ChemistryError: ChemistryError;
  LoadingState: LoadingState;
  ValueWithUnit: ValueWithUnit;
  ValidationResult: ValidationResult;
};

export interface DilutionState {
  initialConcentration: string;
  initialVolume: string;
  finalConcentration: string;
  finalVolume: string;
  isCalculating: boolean;
  result: DilutionResult | null;
  error: string | null;
}

export interface SolutionPrepState {
  desiredMolarity: string;
  desiredVolume: string;
  isCalculating: boolean;
  massNeeded: number | null;
  steps: string[];
  error: string | null;
}
export interface InputState {
  showSuggestionsList: boolean;
  activeSuggestionIndex: number;
  isValidating: boolean;
}

export interface BalanceState {
  equation: string;
  balanceMethod: BalanceMethod;
  
  isValid: boolean;
  errors: readonly string[];
  warnings: readonly string[];
  
  isCalculating: boolean;
  result: BalanceResult | null;
  error: string | null;
  lastCalculatedEquation: string;
  
  showSteps: boolean;
  showElementCount: boolean;
  copySuccess: string;
}
export interface ConversionState {
  inputs: {
    grams: string;
    moles: string;
    molecules: string;
  };
  
  isCalculating: {
    grams: boolean;
    moles: boolean;
    molecules: boolean;
  };
  
  results: readonly ConversionResult[];
}

export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  id?: string;
  ariaLabel?: string;
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
}

export interface HeaderProps {
  navItems?: NavItem[];
  activeItem?: string;
  onNavItemClick?: (itemId: string) => void;
  showMobileMenu?: boolean;
  customLogo?: React.ReactNode;
}

export interface LayoutProps {
  children: React.ReactNode;
  currentPage?: string;
  onNavigate?: (pageId: string) => void;
  showFooter?: boolean;
  className?: string;
}

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  shadow?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  className?: string;
  border?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}
export interface ResultCardProps {
  title: string;
  value: string;
  unit?: string;
  steps?: string[];
  success?: boolean;
  error?: string;
  loading?: boolean;
  additionalInfo?: React.ReactNode;
}

export interface InfoCardProps {
  icon?: React.ReactNode;
  title: string;
  content: React.ReactNode;
  variant?: 'blue' | 'green' | 'yellow' | 'purple';
}

export interface CalculationEntry {
  readonly id: string;
  readonly type: 'molar-mass' | 'conversion' | 'concentration' | 'balance';
  readonly formula: string;
  readonly result: MolarMassResult | ConversionResult | ConcentrationResult | BalanceResult;
  readonly timestamp: number;
  readonly isFavorite: boolean;
  readonly notes?: string;
  readonly tags: readonly string[];
  readonly metadata?: {
    readonly executionTime?: number;
    readonly version?: string;
    readonly [key: string]: unknown;
  };
}

export interface CalculationFilters {
  readonly type?: CalculationEntry['type'];
  readonly favoritesOnly?: boolean;
  readonly dateRange?: {
    readonly start: Date;
    readonly end: Date;
  };
  readonly searchText?: string;
  readonly tags?: readonly string[];
}

export interface CalculationStats {
  readonly total: number;
  readonly byType: Record<CalculationEntry['type'], number>;
  readonly favorites: number;
  readonly today: number;
  readonly thisWeek: number;
  readonly topFormulas: ReadonlyArray<{ readonly formula: string; readonly count: number }>;
  readonly topTags: ReadonlyArray<{ readonly tag: string; readonly count: number }>;
}

export interface FormulaCategory {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly count: number;
}

export interface ProcessedCompound extends ChemicalCompound {
  readonly categoryId: string;
  readonly categoryName: string;
}

export interface FormulaSearchResult {
  readonly compounds: readonly ProcessedCompound[];
  readonly totalResults: number;
  readonly categories: readonly string[];
  readonly searchTerm: string;
}

export interface FormulaSuggestion {
  readonly formula: string;
  readonly name: string;
  readonly commonName?: string;
  readonly category: string;
  readonly type: 'exact' | 'prefix' | 'similar' | 'popular';
  readonly confidence: number;
}

export interface ValidationWithSuggestions {
  readonly isValid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
  readonly suggestions: readonly FormulaSuggestion[];
  readonly knownCompound?: ProcessedCompound;
}

export interface SuggestionOptions {
  readonly maxSuggestions?: number;
  readonly includePopular?: boolean;
  readonly categoryFilter?: string;
  readonly minConfidence?: number;
}
export interface Token {
  readonly type: 'element' | 'number' | 'open-paren' | 'close-paren';
  readonly value: string;
  readonly position: number;
}

export interface ParseResult {
  readonly elements: Record<string, number>;
  readonly isValid: boolean;
  readonly error?: string;
}

export interface ElementBalance {
  readonly element: string;
  readonly reactantCount: number;
  readonly productCount: number;
  readonly isBalanced: boolean;
}

export interface EquationParseResult {
  readonly reactants: readonly EquationCompound[];
  readonly products: readonly EquationCompound[];
  readonly allElements: readonly string[];
  readonly isValid: boolean;
  readonly error?: string;
}