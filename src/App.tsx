import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Bot,
  CalendarClock,
  Check,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  Code2,
  Cpu,
  Eye,
  FileCode2,
  Gauge,
  GitBranch,
  Info,
  LayoutDashboard,
  ListChecks,
  LockKeyhole,
  Menu,
  MoreVertical,
  Network,
  Plus,
  Power,
  Radio,
  RotateCcw,
  Save,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TrendingDown,
  TrendingUp,
  X,
  Zap
} from "lucide-react";
import { useMemo, useState } from "react";
import cactusTradingLogo from "./assets/cactus-trading-logo.svg";

type MarketMode =
  | "Tendencial alcista"
  | "Tendencial bajista"
  | "Lateral / Rango"
  | "Alta volatilidad"
  | "Baja liquidez";

type AutomationMode =
  | "Solo señales"
  | "Señal + Confirmación"
  | "Entrada automática + Salida manual"
  | "Automático completo";

type SafetyKey =
  | "spread"
  | "atr"
  | "news"
  | "lossStreak"
  | "dailyLoss"
  | "weeklyLoss"
  | "session"
  | "liquidity";

type SessionKey = "london" | "newYork" | "asia";

type BrokerEnvironment = "Demo / Paper" | "Live";

type BrokerStatus = "Conectado" | "Pendiente" | "Error" | "Desactivado";

type BrokerPermissionKey =
  | "marketData"
  | "accountRead"
  | "orders"
  | "modifyCancel"
  | "positions"
  | "withdrawalsBlocked";

type ConnectionCheckKey = "auth" | "marketData" | "account" | "dryRun" | "clock";

type Page =
  | "Configuración"
  | "Plantillas"
  | "Bots / Estrategias"
  | "Indicadores"
  | "Brokers / APIs";

type StrategyBot = {
  id: string;
  name: string;
  strategy: string;
  market: string;
  timeframe: string;
  status: "Activo" | "Pausado" | "Detenido";
  risk: string;
  pnl: string;
  trades: number;
  accent: string;
  description: string;
  source: string;
};

type Indicator = {
  id: string;
  name: string;
  category: string;
  output: string;
  timeframe: string;
  status: "Activo" | "Experimental" | "Archivado";
  usedBy: string[];
  description: string;
  accent: string;
  source: string;
};

type TemplateStatus = "Activa" | "Borrador" | "Archivada";

type BotConfiguration = {
  marketMode: MarketMode;
  asset: string;
  timeframe: string;
  bias: string;
  risk: number;
  stopLoss: number;
  takeProfit: number;
  maxTrades: number;
  automationMode: AutomationMode;
  sessions: SessionKey[];
  safety: SafetyKey[];
};

type TradingTemplate = {
  id: string;
  name: string;
  description: string;
  status: TemplateStatus;
  botIds: string[];
  indicatorIds: string[];
  config: BotConfiguration;
};

type BrokerConnection = {
  id: string;
  name: string;
  category: string;
  status: BrokerStatus;
  environment: BrokerEnvironment;
  priority: "Principal" | "Alternativo" | "Futuro";
  accountLabel: string;
  apiKey: string;
  apiSecret: string;
  baseUrl: string;
  instruments: string[];
  primaryInstrument: string;
  marketDataPlan: string;
  permissions: Record<BrokerPermissionKey, boolean>;
  checks: Record<ConnectionCheckKey, boolean>;
  maxContracts: number;
  dailyLossLimit: number;
  orderThrottle: number;
  lastSync: string;
  notes: string;
};

const marketModes: Array<{
  title: MarketMode;
  description: string;
  icon: typeof TrendingUp;
  color: string;
}> = [
  {
    title: "Tendencial alcista",
    description: "Buscar largos en retrocesos",
    icon: TrendingUp,
    color: "text-emerald-400"
  },
  {
    title: "Tendencial bajista",
    description: "Buscar cortos en rebotes",
    icon: TrendingDown,
    color: "text-rose-400"
  },
  {
    title: "Lateral / Rango",
    description: "Operar rango o no operar",
    icon: RotateCcw,
    color: "text-amber-300"
  },
  {
    title: "Alta volatilidad",
    description: "Reducir tamaño o pausar",
    icon: Activity,
    color: "text-violet-300"
  },
  {
    title: "Baja liquidez",
    description: "No operar",
    icon: Zap,
    color: "text-blue-300"
  }
];

const automationModes: Array<{
  title: AutomationMode;
  label: string;
  description: string;
}> = [
  {
    title: "Solo señales",
    label: "Modo 1: Solo señales",
    description: "El bot detecta oportunidades y envía alertas"
  },
  {
    title: "Señal + Confirmación",
    label: "Modo 2: Señal + Confirmación",
    description: "El bot sugiere entrada y tú confirmas"
  },
  {
    title: "Entrada automática + Salida manual",
    label: "Modo 3: Entrada automática + Salida manual",
    description: "El bot entra automáticamente y tú gestionas la salida"
  },
  {
    title: "Automático completo",
    label: "Modo 4: Automático completo",
    description: "El bot opera automáticamente con límites estrictos"
  }
];

const navItems = [
  { label: "Configuración", icon: Settings },
  { label: "Brokers / APIs", icon: Network },
  { label: "Plantillas", icon: ClipboardList },
  { label: "Bots / Estrategias", icon: Bot },
  { label: "Indicadores", icon: Activity }
];

const brokerPermissionLabels: Record<BrokerPermissionKey, string> = {
  marketData: "Datos de mercado en tiempo real",
  accountRead: "Lectura de cuenta y saldo",
  orders: "Enviar órdenes",
  modifyCancel: "Modificar y cancelar órdenes",
  positions: "Leer posiciones abiertas",
  withdrawalsBlocked: "Retiros bloqueados desde la API"
};

const connectionCheckLabels: Record<ConnectionCheckKey, string> = {
  auth: "Autenticación API",
  marketData: "Stream de datos",
  account: "Sincronización de cuenta",
  dryRun: "Orden de prueba / dry-run",
  clock: "Reloj y sesión de mercado"
};

const brokerConnectionsSeed: BrokerConnection[] = [
  {
    id: "tradovate",
    name: "Tradovate",
    category: "Futuros Nasdaq",
    status: "Pendiente",
    environment: "Demo / Paper",
    priority: "Principal",
    accountLabel: "MNQ demo",
    apiKey: "",
    apiSecret: "",
    baseUrl: "https://demo.tradovateapi.com/v1",
    instruments: ["MNQ", "NQ"],
    primaryInstrument: "MNQ",
    marketDataPlan: "CME real-time / demo",
    permissions: {
      marketData: true,
      accountRead: true,
      orders: true,
      modifyCancel: true,
      positions: true,
      withdrawalsBlocked: true
    },
    checks: {
      auth: false,
      marketData: false,
      account: false,
      dryRun: false,
      clock: true
    },
    maxContracts: 1,
    dailyLossLimit: 150,
    orderThrottle: 3,
    lastSync: "Sin probar",
    notes: "Recomendado para el primer MVP con micro futuro MNQ y cuenta demo."
  },
  {
    id: "interactive-brokers",
    name: "Interactive Brokers",
    category: "Multi-mercado",
    status: "Desactivado",
    environment: "Demo / Paper",
    priority: "Alternativo",
    accountLabel: "Paper trading",
    apiKey: "",
    apiSecret: "",
    baseUrl: "TWS / IB Gateway local",
    instruments: ["MNQ", "NQ", "QQQ", "Acciones Nasdaq"],
    primaryInstrument: "MNQ",
    marketDataPlan: "Suscripciones IBKR",
    permissions: {
      marketData: true,
      accountRead: true,
      orders: false,
      modifyCancel: false,
      positions: true,
      withdrawalsBlocked: true
    },
    checks: {
      auth: false,
      marketData: false,
      account: false,
      dryRun: false,
      clock: false
    },
    maxContracts: 1,
    dailyLossLimit: 150,
    orderThrottle: 2,
    lastSync: "Sin probar",
    notes: "Más profesional y amplio, pero conviene integrarlo después del MVP."
  },
  {
    id: "mt5",
    name: "MT5 Bridge",
    category: "CFDs NAS100",
    status: "Desactivado",
    environment: "Demo / Paper",
    priority: "Alternativo",
    accountLabel: "Broker CFD demo",
    apiKey: "",
    apiSecret: "",
    baseUrl: "Servidor MetaTrader / bridge local",
    instruments: ["NAS100", "US100"],
    primaryInstrument: "NAS100",
    marketDataPlan: "Datos del broker CFD",
    permissions: {
      marketData: true,
      accountRead: true,
      orders: false,
      modifyCancel: false,
      positions: true,
      withdrawalsBlocked: true
    },
    checks: {
      auth: false,
      marketData: false,
      account: false,
      dryRun: false,
      clock: false
    },
    maxContracts: 1,
    dailyLossLimit: 100,
    orderThrottle: 2,
    lastSync: "Sin probar",
    notes: "Útil para empezar rápido con CFDs, validando bien spreads y ejecución."
  }
];

const indicatorsLibrary: Indicator[] = [
  {
    id: "ema-200",
    name: "EMA 200",
    category: "Tendencia",
    output: "trendBias",
    timeframe: "Multi",
    status: "Activo",
    usedBy: ["Blue", "Green", "Black"],
    description: "Media móvil exponencial de 200 periodos para filtrar dirección principal.",
    accent: "from-blue-500 to-cyan-300",
    source: `export function ema200(candles) {
  const values = candles.map((candle) => candle.close);
  const ema = exponentialMovingAverage(values, 200);

  return {
    value: ema.at(-1),
    trendBias: values.at(-1) > ema.at(-1) ? "bullish" : "bearish"
  };
}`
  },
  {
    id: "rsi-14",
    name: "RSI 14",
    category: "Momentum",
    output: "momentumScore",
    timeframe: "5m / 15m",
    status: "Activo",
    usedBy: ["Blue", "Red"],
    description: "Oscilador de fuerza relativa para confirmar momentum y agotamiento.",
    accent: "from-violet-500 to-fuchsia-300",
    source: `export function rsi14(candles) {
  const closes = candles.map((candle) => candle.close);
  const value = relativeStrengthIndex(closes, 14);

  return {
    value,
    momentumScore: value > 50 ? "positive" : "negative"
  };
}`
  },
  {
    id: "volume-sma-20",
    name: "Volumen SMA 20",
    category: "Volumen",
    output: "volumeImpulse",
    timeframe: "Multi",
    status: "Activo",
    usedBy: ["Blue", "Pink"],
    description: "Compara volumen actual contra la media de 20 periodos para validar ruptura.",
    accent: "from-emerald-500 to-lime-300",
    source: `export function volumeSma20(candles) {
  const volumes = candles.map((candle) => candle.volume);
  const average = simpleMovingAverage(volumes, 20).at(-1);
  const current = volumes.at(-1);

  return {
    value: current / average,
    volumeImpulse: current > average * 1.2
  };
}`
  },
  {
    id: "atr-14",
    name: "ATR 14",
    category: "Volatilidad",
    output: "atrPercent",
    timeframe: "Multi",
    status: "Activo",
    usedBy: ["Pink", "Black"],
    description: "Mide volatilidad relativa para pausar entradas cuando el rango se expande.",
    accent: "from-amber-400 to-orange-300",
    source: `export function atr14(candles) {
  const atr = averageTrueRange(candles, 14);
  const lastClose = candles.at(-1).close;

  return {
    value: atr,
    atrPercent: atr / lastClose
  };
}`
  },
  {
    id: "vwap-deviation",
    name: "Desviación VWAP",
    category: "Precio",
    output: "vwapDeviation",
    timeframe: "1m",
    status: "Experimental",
    usedBy: ["Red"],
    description: "Evalúa distancia del precio contra VWAP para detectar reversión intradía.",
    accent: "from-rose-500 to-red-300",
    source: `export function vwapDeviation(candles) {
  const vwap = sessionVwap(candles);
  const price = candles.at(-1).close;

  return {
    value: (price - vwap) / vwap,
    vwapDeviation: Math.abs(price - vwap) / vwap
  };
}`
  },
  {
    id: "news-window",
    name: "News Window",
    category: "Seguridad",
    output: "newsClear",
    timeframe: "Sesión",
    status: "Experimental",
    usedBy: ["White"],
    description: "Bloquea señales cerca de eventos macro configurados manualmente.",
    accent: "from-slate-300 to-blue-200",
    source: `export function newsWindow(now, events) {
  const blocked = events.some((event) => {
    const distance = Math.abs(event.timestamp - now);
    return distance < 30 * 60 * 1000;
  });

  return {
    newsClear: !blocked
  };
}`
  }
];

const strategyBots: StrategyBot[] = [
  {
    id: "blue",
    name: "Blue",
    strategy: "Momentum BTC",
    market: "BTC/USDT",
    timeframe: "15m",
    status: "Activo",
    risk: "1.00%",
    pnl: "+4.8%",
    trades: 18,
    accent: "from-blue-500 to-cyan-300",
    description: "Busca continuación tendencial con EMA 200, RSI y filtro de volumen.",
    source: `export const blueBot = {
  name: "Blue",
  market: "BTC/USDT",
  timeframe: "15m",
  mode: "trend-following",
  entry: [
    "price > ema(200)",
    "rsi(14) > 50",
    "volume > sma(volume, 20) * 1.2"
  ],
  risk: {
    perTrade: 0.01,
    stopLoss: 0.01,
    takeProfit: "2R"
  }
};`
  },
  {
    id: "red",
    name: "Red",
    strategy: "Reversión NASDAQ",
    market: "NASDAQ",
    timeframe: "1m",
    status: "Pausado",
    risk: "0.60%",
    pnl: "-0.7%",
    trades: 9,
    accent: "from-rose-500 to-orange-300",
    description: "Detecta extremos intradía y espera confirmación antes de abrir cortos.",
    source: `export const redBot = {
  name: "Red",
  market: "NASDAQ",
  timeframe: "1m",
  mode: "mean-reversion",
  entry: [
    "price rejects vwap deviation",
    "rsi(7) < 35",
    "spread < 0.08%"
  ],
  risk: {
    perTrade: 0.006,
    dailyLossLimit: 0.025,
    maxTrades: 5
  }
};`
  },
  {
    id: "pink",
    name: "Pink",
    strategy: "Breakout ETH",
    market: "ETH/USDT",
    timeframe: "5m",
    status: "Activo",
    risk: "0.80%",
    pnl: "+2.1%",
    trades: 14,
    accent: "from-fuchsia-500 to-pink-300",
    description: "Opera rupturas de rango con confirmación de volumen y trailing stop.",
    source: `export const pinkBot = {
  name: "Pink",
  market: "ETH/USDT",
  timeframe: "5m",
  mode: "breakout",
  entry: [
    "close > rangeHigh(48)",
    "volumeSpike(20, 1.5)",
    "atr(14) < 2.2%"
  ],
  exits: ["trailingStop(1.1%)", "takeProfit(2.4R)"]
};`
  },
  {
    id: "white",
    name: "White",
    strategy: "Sesión Londres",
    market: "EUR/USD",
    timeframe: "30m",
    status: "Detenido",
    risk: "0.40%",
    pnl: "+0.0%",
    trades: 0,
    accent: "from-slate-100 to-slate-400",
    description: "Estrategia conservadora para operar solo la apertura europea.",
    source: `export const whiteBot = {
  name: "White",
  market: "EUR/USD",
  timeframe: "30m",
  session: "London",
  mode: "session-filtered",
  entry: [
    "sessionTime between 07:00 and 11:00",
    "trendStrength > 0.55",
    "newsWindow clear"
  ],
  automation: "signal-confirmation"
};`
  },
  {
    id: "black",
    name: "Black",
    strategy: "Defensivo Crypto",
    market: "BTC/USDT",
    timeframe: "1h",
    status: "Pausado",
    risk: "0.35%",
    pnl: "+1.3%",
    trades: 6,
    accent: "from-slate-700 to-slate-300",
    description: "Prioriza preservación de capital y pausa cuando aumenta la volatilidad.",
    source: `export const blackBot = {
  name: "Black",
  market: "BTC/USDT",
  timeframe: "1h",
  mode: "capital-protection",
  guards: [
    "dailyLoss < 2%",
    "weeklyLoss < 7%",
    "atr(14) < 1.8%"
  ],
  positionSizing: "reduced-risk"
};`
  },
  {
    id: "green",
    name: "Green",
    strategy: "Swing Tendencial",
    market: "ETH/USDT",
    timeframe: "1h",
    status: "Activo",
    risk: "1.20%",
    pnl: "+7.4%",
    trades: 11,
    accent: "from-emerald-500 to-lime-300",
    description: "Sigue tendencias de mayor duración con sesgo largo y filtros de liquidez.",
    source: `export const greenBot = {
  name: "Green",
  market: "ETH/USDT",
  timeframe: "1h",
  mode: "swing-trend",
  entry: [
    "ema(50) > ema(200)",
    "pullbackTo(ema(50))",
    "liquidity24h > 1_000_000"
  ],
  risk: {
    perTrade: 0.012,
    takeProfit: "3R"
  }
};`
  }
];

const tradingTemplates: TradingTemplate[] = [
  {
    id: "swing-btc-15m",
    name: "Swing BTC 15m",
    description:
      "Plantilla tendencial para BTC con confirmación de momentum y control de riesgo moderado.",
    status: "Activa",
    botIds: ["blue", "black"],
    indicatorIds: ["ema-200", "rsi-14", "atr-14"],
    config: {
      marketMode: "Tendencial alcista",
      asset: "BTC/USDT",
      timeframe: "15m",
      bias: "Solo largos",
      risk: 1,
      stopLoss: 1,
      takeProfit: 2,
      maxTrades: 3,
      automationMode: "Señal + Confirmación",
      sessions: ["london", "newYork"],
      safety: ["spread", "atr", "news", "lossStreak", "dailyLoss", "weeklyLoss", "session", "liquidity"]
    }
  },
  {
    id: "scalping-nasdaq-m1",
    name: "Scalping NASDAQ M1",
    description:
      "Setup rápido de reversión intradía con filtros de VWAP y exposición reducida.",
    status: "Borrador",
    botIds: ["red"],
    indicatorIds: ["rsi-14", "vwap-deviation", "news-window"],
    config: {
      marketMode: "Lateral / Rango",
      asset: "NASDAQ",
      timeframe: "1m",
      bias: "Largos y cortos",
      risk: 0.6,
      stopLoss: 0.8,
      takeProfit: 1.5,
      maxTrades: 5,
      automationMode: "Solo señales",
      sessions: ["newYork"],
      safety: ["spread", "news", "dailyLoss", "session"]
    }
  },
  {
    id: "crypto-intradia",
    name: "Crypto Intradía",
    description:
      "Composición para rupturas en ETH con volumen, ATR y trailing stop operativo.",
    status: "Activa",
    botIds: ["pink", "green"],
    indicatorIds: ["ema-200", "volume-sma-20", "atr-14"],
    config: {
      marketMode: "Alta volatilidad",
      asset: "ETH/USDT",
      timeframe: "5m",
      bias: "Largos y cortos",
      risk: 0.8,
      stopLoss: 1.1,
      takeProfit: 2.4,
      maxTrades: 4,
      automationMode: "Entrada automática + Salida manual",
      sessions: ["london", "newYork", "asia"],
      safety: ["atr", "lossStreak", "dailyLoss", "weeklyLoss", "liquidity"]
    }
  }
];

const safetyLabels: Record<SafetyKey, string> = {
  spread: "No operar si spread >",
  atr: "No operar si volatilidad ATR >",
  news: "No operar cerca de noticias",
  lossStreak: "Pausa si hay 2 pérdidas consecutivas",
  dailyLoss: "Pérdida máxima diaria",
  weeklyLoss: "Pérdida máxima semanal",
  session: "Horario permitido",
  liquidity: "Liquidez mínima 24h"
};

const classNames = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const enabledKeys = <T extends string>(values: Record<T, boolean>) =>
  Object.entries(values)
    .filter(([, enabled]) => enabled)
    .map(([key]) => key as T);

const toBooleanMap = <T extends string>(keys: T[], selected: T[]) =>
  keys.reduce(
    (map, key) => ({
      ...map,
      [key]: selected.includes(key)
    }),
    {} as Record<T, boolean>
  );

const describeTemplateConfig = (config: BotConfiguration) =>
  `${config.asset} · ${config.timeframe} · ${config.automationMode}`;

const updateIdSelection = (ids: string[], id: string, selected: boolean) =>
  selected ? Array.from(new Set([...ids, id])) : ids.filter((item) => item !== id);

const generateBotSource = (bot: Pick<StrategyBot, "name" | "market" | "timeframe" | "strategy" | "risk">) => {
  const exportName = `${slugify(bot.name).replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase()) || "new"}Bot`;

  return `export const ${exportName} = {
  name: "${bot.name}",
  market: "${bot.market}",
  timeframe: "${bot.timeframe}",
  strategy: "${bot.strategy}",
  mode: "custom-strategy",
  entry: [
    "define primary condition",
    "confirm market context",
    "validate safety filters"
  ],
  risk: {
    perTrade: "${bot.risk}",
    stopLoss: "1.00%",
    takeProfit: "2R"
  },
  automation: "signal-confirmation"
};`;
};

const generateIndicatorSource = (
  indicator: Pick<Indicator, "name" | "category" | "output" | "timeframe">
) => {
  const exportName =
    slugify(indicator.name).replace(/-([a-z])/g, (_, letter: string) =>
      letter.toUpperCase()
    ) || "customIndicator";

  return `export function ${exportName}(candles, context = {}) {
  const latest = candles.at(-1);

  return {
    name: "${indicator.name}",
    category: "${indicator.category}",
    timeframe: "${indicator.timeframe}",
    ${indicator.output}: latest.close
  };
}`;
};

function App() {
  const [botStatus, setBotStatus] = useState<"Detenido" | "Activo">("Detenido");
  const [toast, setToast] = useState("");
  const [activePage, setActivePage] = useState<Page>("Configuración");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [bots, setBots] = useState<StrategyBot[]>(strategyBots);
  const [creatingBot, setCreatingBot] = useState(false);
  const [selectedBotId, setSelectedBotId] = useState("blue");
  const [indicators, setIndicators] = useState<Indicator[]>(indicatorsLibrary);
  const [creatingIndicator, setCreatingIndicator] = useState(false);
  const [selectedIndicatorId, setSelectedIndicatorId] = useState("ema-200");
  const [templates, setTemplates] = useState<TradingTemplate[]>(tradingTemplates);
  const [creatingTemplate, setCreatingTemplate] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState("swing-btc-15m");
  const [brokerConnections, setBrokerConnections] = useState<BrokerConnection[]>(
    brokerConnectionsSeed
  );
  const [selectedBrokerId, setSelectedBrokerId] = useState("tradovate");
  const [marketMode, setMarketMode] = useState<MarketMode>("Tendencial alcista");
  const [asset, setAsset] = useState("BTC/USDT");
  const [timeframe, setTimeframe] = useState("15m");
  const [bias, setBias] = useState("Solo largos");
  const [risk, setRisk] = useState(1);
  const [stopLoss, setStopLoss] = useState(1);
  const [takeProfit, setTakeProfit] = useState(2);
  const [trailingStop, setTrailingStop] = useState(true);
  const [trailingDistance, setTrailingDistance] = useState(1);
  const [positionSize, setPositionSize] = useState("Por riesgo (%)");
  const [maxTrades, setMaxTrades] = useState(3);
  const [leverage, setLeverage] = useState("3x");
  const [automationMode, setAutomationMode] =
    useState<AutomationMode>("Señal + Confirmación");
  const [sessions, setSessions] = useState<Record<SessionKey, boolean>>({
    london: true,
    newYork: true,
    asia: false
  });
  const [safety, setSafety] = useState<Record<SafetyKey, boolean>>({
    spread: true,
    atr: true,
    news: true,
    lossStreak: true,
    dailyLoss: true,
    weeklyLoss: true,
    session: true,
    liquidity: true
  });

  const activeFilters = useMemo(
    () => Object.values(safety).filter(Boolean).length,
    [safety]
  );

  const activeSchedule = useMemo(() => {
    const enabled = [];
    if (sessions.london) enabled.push("Londres");
    if (sessions.newYork) enabled.push("NY");
    if (sessions.asia) enabled.push("Asia");
    return enabled.length ? enabled.join(" / ") : "Sin sesiones";
  }, [sessions]);

  const selectedAutomation = automationModes.find(
    (mode) => mode.title === automationMode
  )!;
  const selectedBot =
    bots.find((bot) => bot.id === selectedBotId) ?? bots[0];
  const selectedIndicator =
    indicators.find((indicator) => indicator.id === selectedIndicatorId) ??
    indicators[0];
  const selectedTemplate =
    templates.find((template) => template.id === selectedTemplateId) ??
    templates[0];
  const selectedBroker =
    brokerConnections.find((broker) => broker.id === selectedBrokerId) ??
    brokerConnections[0];

  const saveConfig = () => {
    setToast("Configuración guardada");
    window.setTimeout(() => setToast(""), 2200);
  };

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  const updateBot = (id: string, patch: Partial<StrategyBot>) => {
    setBots((currentBots) =>
      currentBots.map((bot) =>
        bot.id === id
          ? {
              ...bot,
              ...patch,
              source:
                patch.name || patch.market || patch.timeframe || patch.strategy || patch.risk
                  ? generateBotSource({ ...bot, ...patch })
                  : patch.source ?? bot.source
            }
          : bot
      )
    );
  };

  const createBot = (bot: StrategyBot) => {
    setBots((currentBots) => [bot, ...currentBots]);
    setSelectedBotId(bot.id);
    showToast("Bot creado");
  };

  const updateIndicator = (id: string, patch: Partial<Indicator>) => {
    setIndicators((currentIndicators) =>
      currentIndicators.map((indicator) =>
        indicator.id === id
          ? {
              ...indicator,
              ...patch,
              source:
                patch.name ||
                patch.category ||
                patch.output ||
                patch.timeframe
                  ? generateIndicatorSource({ ...indicator, ...patch })
                  : patch.source ?? indicator.source
            }
          : indicator
      )
    );
  };

  const createIndicator = (indicator: Indicator) => {
    setIndicators((currentIndicators) => [indicator, ...currentIndicators]);
    setSelectedIndicatorId(indicator.id);
    showToast("Indicador creado");
  };

  const updateTemplate = (id: string, patch: Partial<TradingTemplate>) => {
    setTemplates((currentTemplates) =>
      currentTemplates.map((template) =>
        template.id === id ? { ...template, ...patch } : template
      )
    );
  };

  const updateBroker = (id: string, patch: Partial<BrokerConnection>) => {
    setBrokerConnections((currentBrokers) =>
      currentBrokers.map((broker) =>
        broker.id === id ? { ...broker, ...patch } : broker
      )
    );
  };

  const testBrokerConnection = (id: string) => {
    setBrokerConnections((currentBrokers) =>
      currentBrokers.map((broker) =>
        broker.id === id
          ? {
              ...broker,
              status: "Conectado",
              checks: {
                auth: true,
                marketData: true,
                account: true,
                dryRun: broker.environment === "Demo / Paper",
                clock: true
              },
              lastSync: "Ahora"
            }
          : broker
      )
    );
    showToast("Conexión validada en modo demo");
  };

  const createTemplate = (template: TradingTemplate) => {
    setTemplates((currentTemplates) => [template, ...currentTemplates]);
    setSelectedTemplateId(template.id);
    showToast("Plantilla creada");
  };

  const applyTemplate = (template: TradingTemplate) => {
    setMarketMode(template.config.marketMode);
    setAsset(template.config.asset);
    setTimeframe(template.config.timeframe);
    setBias(template.config.bias);
    setRisk(template.config.risk);
    setStopLoss(template.config.stopLoss);
    setTakeProfit(template.config.takeProfit);
    setMaxTrades(template.config.maxTrades);
    setAutomationMode(template.config.automationMode);
    setSessions(toBooleanMap(["london", "newYork", "asia"], template.config.sessions));
    setSafety(
      toBooleanMap(
        ["spread", "atr", "news", "lossStreak", "dailyLoss", "weeklyLoss", "session", "liquidity"],
        template.config.safety
      )
    );
    if (template.botIds[0]) setSelectedBotId(template.botIds[0]);
    if (template.indicatorIds[0]) setSelectedIndicatorId(template.indicatorIds[0]);
    showToast(`Plantilla aplicada: ${template.name}`);
  };

  return (
    <div className="min-h-screen text-slate-100">
      <div className="flex min-h-screen">
        <Sidebar
          activePage={activePage}
          botStatus={botStatus}
          isMobileOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          onNavigate={(page) => {
            setActivePage(page);
            setIsMobileMenuOpen(false);
          }}
          onStart={() => setBotStatus("Activo")}
          onEmergency={() => setBotStatus("Detenido")}
        />

        <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
          <Header
            activePage={activePage}
            onOpenMenu={() => setIsMobileMenuOpen(true)}
            onNewIndicator={() => {
              setActivePage("Indicadores");
              setCreatingIndicator(true);
              showToast("Completa el formulario del nuevo indicador");
            }}
            onNewBot={() => {
              setActivePage("Bots / Estrategias");
              setCreatingBot(true);
              showToast("Completa el formulario del nuevo bot");
            }}
            onNewTemplate={() => {
              setActivePage("Plantillas");
              setCreatingTemplate(true);
              showToast("Completa la nueva plantilla");
            }}
            onSave={saveConfig}
            onShowBots={() => setActivePage("Bots / Estrategias")}
            onShowTemplates={() => setActivePage("Plantillas")}
          />

          {activePage === "Configuración" ? (
            <main className="grid gap-5 px-4 py-5 sm:px-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <section className="grid min-w-0 gap-5 xl:grid-cols-3">
                <MarketModeCard value={marketMode} onChange={setMarketMode} />
                <StrategyCard
                  asset={asset}
                  timeframe={timeframe}
                  bias={bias}
                  onAsset={setAsset}
                  onTimeframe={setTimeframe}
                  onBias={setBias}
                />
                <RiskCard
                  risk={risk}
                  stopLoss={stopLoss}
                  takeProfit={takeProfit}
                  trailingStop={trailingStop}
                  trailingDistance={trailingDistance}
                  positionSize={positionSize}
                  maxTrades={maxTrades}
                  leverage={leverage}
                  onRisk={setRisk}
                  onStopLoss={setStopLoss}
                  onTakeProfit={setTakeProfit}
                  onTrailingStop={setTrailingStop}
                  onTrailingDistance={setTrailingDistance}
                  onPositionSize={setPositionSize}
                  onMaxTrades={setMaxTrades}
                  onLeverage={setLeverage}
                />
                <SafetyCard safety={safety} onSafety={setSafety} />
                <ScheduleCard sessions={sessions} onSessions={setSessions} />
                <AutomationCard
                  value={automationMode}
                  onChange={setAutomationMode}
                />
                <div className="panel rounded-xl px-4 py-3 text-sm text-slate-300 xl:col-span-3">
                  <div className="flex items-center gap-3">
                    <Info className="h-5 w-5 text-blue-400" />
                    <span>
                      Consejo: Comienza en Modo 2 (Señal + Confirmación) y ajusta
                      los parámetros según tu estilo de trading.
                    </span>
                  </div>
                </div>
              </section>

              <RightPanel
                asset={asset}
                timeframe={timeframe}
                marketMode={marketMode}
                bias={bias}
                risk={risk}
                stopLoss={stopLoss}
                takeProfit={takeProfit}
                maxTrades={maxTrades}
                schedule={activeSchedule}
                automationMode={automationMode}
                activeFilters={activeFilters}
                dailyLoss={3}
                weeklyLoss={10}
                automationDescription={selectedAutomation.description}
              />
            </main>
          ) : activePage === "Brokers / APIs" ? (
            <BrokersPage
              brokers={brokerConnections}
              onSelectBroker={setSelectedBrokerId}
              onTestConnection={testBrokerConnection}
              onUpdateBroker={updateBroker}
              selectedBroker={selectedBroker}
            />
          ) : activePage === "Plantillas" ? (
            <TemplatesPage
              bots={bots}
              creatingTemplate={creatingTemplate}
              currentConfig={{
                marketMode,
                asset,
                timeframe,
                bias,
                risk,
                stopLoss,
                takeProfit,
                maxTrades,
                automationMode,
                sessions: enabledKeys(sessions),
                safety: enabledKeys(safety)
              }}
              indicators={indicators}
              onApplyTemplate={applyTemplate}
              onCreateTemplate={createTemplate}
              onCreatingTemplateChange={setCreatingTemplate}
              onSelectTemplate={setSelectedTemplateId}
              onUpdateTemplate={updateTemplate}
              selectedTemplate={selectedTemplate}
              templates={templates}
            />
          ) : activePage === "Bots / Estrategias" ? (
            <BotsPage
              bots={bots}
              creatingBot={creatingBot}
              onCreateBot={createBot}
              onCreatingBotChange={setCreatingBot}
              selectedBot={selectedBot}
              onSelectBot={setSelectedBotId}
              onUpdateBot={updateBot}
            />
          ) : (
            <IndicatorsPage
              creatingIndicator={creatingIndicator}
              indicators={indicators}
              onCreateIndicator={createIndicator}
              onCreatingIndicatorChange={setCreatingIndicator}
              onSelectIndicator={setSelectedIndicatorId}
              onUpdateIndicator={updateIndicator}
              selectedIndicator={selectedIndicator}
            />
          )}
        </div>
      </div>

      {toast && (
        <div className="fixed right-5 top-5 z-50 rounded-lg border border-emerald-400/40 bg-emerald-500/15 px-4 py-3 text-sm font-semibold text-emerald-200 shadow-glow backdrop-blur">
          {toast}
        </div>
      )}
    </div>
  );
}

function Sidebar({
  activePage,
  botStatus,
  isMobileOpen,
  onClose,
  onNavigate,
  onStart,
  onEmergency
}: {
  activePage: Page;
  botStatus: "Detenido" | "Activo";
  isMobileOpen: boolean;
  onClose: () => void;
  onNavigate: (page: Page) => void;
  onStart: () => void;
  onEmergency: () => void;
}) {
  return (
    <>
      <button
        aria-label="Cerrar menú"
        className={classNames(
          "fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm transition lg:hidden",
          isMobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />
      <aside
        className={classNames(
          "fixed inset-y-0 left-0 z-50 flex w-72 max-w-[84vw] -translate-x-full flex-col border-r border-slate-700/70 bg-slate-950/95 shadow-2xl backdrop-blur-xl transition-transform duration-200 lg:z-40 lg:w-64 lg:max-w-none lg:translate-x-0 lg:bg-slate-950/72",
          isMobileOpen && "translate-x-0"
        )}
      >
        <div className="flex h-20 items-center gap-3 px-5">
          <img
            src={cactusTradingLogo}
            alt="Cactus Trading"
            className="h-12 w-12 shrink-0 rounded-xl bg-white object-cover"
          />
          <span className="text-xl font-bold tracking-tight">Cactus Trading</span>
          <button
            className="icon-button ml-auto lg:hidden"
            aria-label="Cerrar menú"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.label === activePage;
            const isPage =
              item.label === "Configuración" ||
              item.label === "Brokers / APIs" ||
              item.label === "Plantillas" ||
              item.label === "Bots / Estrategias" ||
              item.label === "Indicadores";
            return (
              <button
                className={classNames(
                  "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm transition",
                  active
                    ? "bg-blue-600/22 text-blue-200"
                    : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                )}
                key={item.label}
                onClick={() => {
                  if (isPage) onNavigate(item.label as Page);
                }}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-800/80 px-4 py-4 lg:hidden">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-700/80 bg-slate-900/70 px-4 py-3">
            <div className="min-w-0">
              <p className="text-xs text-slate-400">Binance</p>
              <div className="mt-1 flex items-center gap-2 text-sm font-semibold">
                <span
                  className={classNames(
                    "h-2.5 w-2.5 rounded-full",
                    botStatus === "Activo" ? "bg-emerald-400" : "bg-slate-500"
                  )}
                />
                {botStatus}
              </div>
            </div>
            <button
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-emerald-400/70 bg-emerald-500/10 px-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
              onClick={onStart}
            >
              <Power className="h-4 w-4" />
              Iniciar
            </button>
          </div>
        </div>

        <div className="hidden border-t border-slate-800/80 px-3 py-4 lg:block">
          <div className="rounded-xl border border-slate-700/80 bg-slate-900/60 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wide text-slate-500">
                  Binance
                </p>
                <div className="mt-1 flex items-center gap-2 text-sm font-semibold">
                  <CircleDollarSign className="h-4 w-4 shrink-0 text-amber-300" />
                  <span className="truncate">Cuenta conectada</span>
                </div>
              </div>
              <span
                className={classNames(
                  "h-2.5 w-2.5 shrink-0 rounded-full",
                  botStatus === "Activo" ? "bg-emerald-400" : "bg-slate-500"
                )}
              />
            </div>
            <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-700/70 bg-slate-950/35 px-3 py-2 text-sm">
              <span className="text-slate-400">Estado</span>
              <span className="font-semibold text-slate-100">{botStatus}</span>
            </div>
            <div className="mt-3 grid gap-2">
            <button
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-emerald-400/70 bg-emerald-500/10 px-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
              onClick={onStart}
            >
              <Power className="h-4 w-4" />
              Iniciar
            </button>
            <button
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-rose-500/75 bg-rose-500/10 px-3 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/20"
              onClick={onEmergency}
            >
              <AlertTriangle className="h-4 w-4" />
              Emergencia
            </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function Header({
  activePage,
  onOpenMenu,
  onNewIndicator,
  onNewBot,
  onNewTemplate,
  onSave,
  onShowBots,
  onShowTemplates
}: {
  activePage: Page;
  onOpenMenu: () => void;
  onNewIndicator: () => void;
  onNewBot: () => void;
  onNewTemplate: () => void;
  onSave: () => void;
  onShowBots: () => void;
  onShowTemplates: () => void;
}) {
  const isBotsPage = activePage === "Bots / Estrategias";
  const isIndicatorsPage = activePage === "Indicadores";
  const isTemplatesPage = activePage === "Plantillas";
  const isBrokersPage = activePage === "Brokers / APIs";

  return (
    <header className="border-b border-slate-700/70 bg-slate-950/70 backdrop-blur-xl">
      <div className="flex min-h-20 flex-col gap-4 px-4 py-4 sm:px-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <button
            className="icon-button lg:hidden"
            aria-label="Abrir menú"
            onClick={onOpenMenu}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isIndicatorsPage
                ? "Indicadores"
                : isTemplatesPage
                  ? "Plantillas"
                : isBrokersPage
                  ? "Brokers / APIs"
                : isBotsPage
                  ? "Bots / Estrategias"
                  : "Configuración de Cactus Trading"}
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              {isIndicatorsPage
                ? "Biblioteca de señales técnicas y código reutilizable"
                : isTemplatesPage
                ? "Relaciona bots, indicadores y configuraciones operativas"
                : isBrokersPage
                ? "Configura credenciales, permisos y pruebas antes de conectar bots"
                : isBotsPage
                ? "Gestiona estrategias, estados y código fuente"
                : "Personaliza los parámetros de operación"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isIndicatorsPage ? (
            <>
              <div className="hidden h-11 items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-950/45 px-4 text-sm text-slate-300 sm:flex">
                <Search className="h-4 w-4 text-slate-500" />
                Buscar indicador
              </div>
              <button
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-100 px-5 text-sm font-semibold text-slate-950 transition hover:bg-white"
                onClick={onNewIndicator}
              >
                <Plus className="h-4 w-4" />
                Nuevo indicador
              </button>
            </>
          ) : isTemplatesPage ? (
            <>
              <div className="hidden h-11 items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-950/45 px-4 text-sm text-slate-300 sm:flex">
                <Search className="h-4 w-4 text-slate-500" />
                Buscar plantilla
              </div>
              <button
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-100 px-5 text-sm font-semibold text-slate-950 transition hover:bg-white"
                onClick={onNewTemplate}
              >
                <Plus className="h-4 w-4" />
                Nueva plantilla
              </button>
            </>
          ) : isBrokersPage ? (
            <>
              <button
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-100 px-5 text-sm font-semibold text-slate-950 transition hover:bg-white"
                onClick={onSave}
              >
                <Save className="h-4 w-4" />
                Guardar APIs
              </button>
              <button className="h-11 rounded-lg border border-blue-400/50 bg-blue-500/10 px-5 text-sm font-semibold text-blue-200 transition hover:bg-blue-500/18">
                Modo demo
              </button>
            </>
          ) : isBotsPage ? (
            <>
              <div className="hidden h-11 items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-950/45 px-4 text-sm text-slate-300 sm:flex">
                <Search className="h-4 w-4 text-slate-500" />
                Buscar bot o estrategia
              </div>
              <button
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-100 px-5 text-sm font-semibold text-slate-950 transition hover:bg-white"
                onClick={onNewBot}
              >
                <Plus className="h-4 w-4" />
                Nuevo bot
              </button>
            </>
          ) : (
            <>
              <button
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-100 px-6 text-sm font-semibold text-slate-950 transition hover:bg-white"
                onClick={onSave}
              >
                <Save className="h-4 w-4" />
                Guardar
              </button>
              <button className="h-11 rounded-lg border border-slate-700/80 bg-slate-950/45 px-6 text-sm font-semibold text-slate-100 transition hover:border-blue-400">
                Guardar como
              </button>
              <button
                className="h-11 rounded-lg border border-slate-700/80 bg-slate-950/45 px-5 text-sm font-semibold text-slate-100 transition hover:border-blue-400"
                onClick={onShowTemplates}
              >
                Plantillas
              </button>
              <button
                className="h-11 rounded-lg border border-blue-400/50 bg-blue-500/10 px-5 text-sm font-semibold text-blue-200 transition hover:bg-blue-500/18"
                onClick={onShowBots}
              >
                Ver bots
              </button>
            </>
          )}
          <button className="icon-button" aria-label="Más opciones">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}

function Card({
  title,
  description,
  children,
  className
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <article className={classNames("panel rounded-xl p-5", className)}>
      <div className="mb-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-100">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-sm text-slate-400">{description}</p>
        )}
      </div>
      {children}
    </article>
  );
}

function MarketModeCard({
  value,
  onChange
}: {
  value: MarketMode;
  onChange: (value: MarketMode) => void;
}) {
  return (
    <Card
      title="1. Modo de mercado"
      description="Selecciona el comportamiento según el contexto"
    >
      <label className="mb-3 block text-sm text-slate-300">Modo principal</label>
      <Select value={value} onChange={(next) => onChange(next as MarketMode)}>
        {marketModes.map((mode) => (
          <option key={mode.title}>{mode.title}</option>
        ))}
      </Select>
      <div className="mt-4 overflow-hidden rounded-lg border border-slate-700/70">
        {marketModes.map((mode) => {
          const Icon = mode.icon;
          const active = value === mode.title;
          return (
            <button
              key={mode.title}
              onClick={() => onChange(mode.title)}
              className={classNames(
                "flex w-full items-center gap-4 border-b border-slate-700/55 px-4 py-3 text-left last:border-b-0 transition",
                active
                  ? "border-emerald-400/70 bg-emerald-500/12"
                  : "bg-slate-950/25 hover:bg-slate-800/45"
              )}
            >
              <Icon className={classNames("h-5 w-5", mode.color)} />
              <span className="min-w-0 flex-1">
                <span
                  className={classNames(
                    "block text-sm font-semibold",
                    active ? "text-emerald-300" : "text-slate-100"
                  )}
                >
                  {mode.title}
                </span>
                <span className="mt-0.5 block text-xs text-slate-400">
                  {mode.description}
                </span>
              </span>
              {active && <Check className="h-5 w-5 text-emerald-400" />}
            </button>
          );
        })}
      </div>
    </Card>
  );
}

function StrategyCard({
  asset,
  timeframe,
  bias,
  onAsset,
  onTimeframe,
  onBias
}: {
  asset: string;
  timeframe: string;
  bias: string;
  onAsset: (value: string) => void;
  onTimeframe: (value: string) => void;
  onBias: (value: string) => void;
}) {
  return (
    <Card
      title="2. Parámetros de estrategia"
      description="Define las reglas para generar señales"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Activo">
          <Select value={asset} onChange={onAsset}>
            <option>BTC/USDT</option>
            <option>NASDAQ</option>
            <option>ETH/USDT</option>
            <option>EUR/USD</option>
          </Select>
        </Field>
        <Field label="Timeframe">
          <Select value={timeframe} onChange={onTimeframe}>
            <option>1m</option>
            <option>5m</option>
            <option>15m</option>
            <option>30m</option>
            <option>1h</option>
          </Select>
        </Field>
      </div>

      <Field label="Sesgo" className="mt-4">
        <Segmented
          value={bias}
          options={["Solo largos", "Solo cortos", "Ambos"]}
          onChange={onBias}
        />
      </Field>

      <div className="my-5 h-px bg-slate-700/65" />
      <h3 className="mb-4 text-sm font-medium text-slate-200">
        Indicadores y condiciones
      </h3>
      <ConditionRow label="Tendencia" left="EMA 200" middle="Precio sobre EMA 200" />
      <ConditionRow label="Momentum" left="RSI 14" middle="Mayor que" right="50" />
      <ConditionRow label="Volumen" left="Volumen SMA 20" middle="Mayor que" right="1.2" />
      <button className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-300 transition hover:text-blue-200">
        <Plus className="h-4 w-4" />
        Añadir condición
      </button>
    </Card>
  );
}

function RiskCard({
  risk,
  stopLoss,
  takeProfit,
  trailingStop,
  trailingDistance,
  positionSize,
  maxTrades,
  leverage,
  onRisk,
  onStopLoss,
  onTakeProfit,
  onTrailingStop,
  onTrailingDistance,
  onPositionSize,
  onMaxTrades,
  onLeverage
}: {
  risk: number;
  stopLoss: number;
  takeProfit: number;
  trailingStop: boolean;
  trailingDistance: number;
  positionSize: string;
  maxTrades: number;
  leverage: string;
  onRisk: (value: number) => void;
  onStopLoss: (value: number) => void;
  onTakeProfit: (value: number) => void;
  onTrailingStop: (value: boolean) => void;
  onTrailingDistance: (value: number) => void;
  onPositionSize: (value: string) => void;
  onMaxTrades: (value: number) => void;
  onLeverage: (value: string) => void;
}) {
  return (
    <Card title="3. Gestión de riesgo" description="Configura cómo el bot gestionará tu capital">
      <SliderField label="Riesgo por operación" value={risk} onChange={onRisk} />
      <SliderField label="Stop loss máximo" value={stopLoss} onChange={onStopLoss} />
      <div className="mt-4 grid items-end gap-3 sm:grid-cols-[1fr_96px]">
        <Field label="Take profit">
          <Select value="Relación Riesgo/Beneficio" onChange={() => undefined}>
            <option>Relación Riesgo/Beneficio</option>
          </Select>
        </Field>
        <div className="field flex items-center gap-2">
          <input
            className="w-full bg-transparent text-right outline-none"
            min="0.5"
            step="0.25"
            type="number"
            value={takeProfit}
            onChange={(event) => onTakeProfit(Number(event.target.value))}
          />
          <span className="text-slate-400">R</span>
        </div>
      </div>
      <div className="mt-4 grid items-center gap-3 sm:grid-cols-[1fr_110px]">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-slate-300">Trailing Stop</span>
          <Toggle checked={trailingStop} onChange={onTrailingStop} />
        </div>
        <NumberWithUnit
          value={trailingDistance}
          unit="%"
          onChange={onTrailingDistance}
        />
      </div>
      <div className="mt-5 space-y-4">
        <Field label="Tamaño de posición">
          <Select value={positionSize} onChange={onPositionSize}>
            <option>Por riesgo (%)</option>
            <option>Fijo</option>
            <option>Por capital</option>
          </Select>
        </Field>
        <Field label="Máximo de operaciones al día">
          <Select value={String(maxTrades)} onChange={(value) => onMaxTrades(Number(value))}>
            <option>1</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
            <option>5</option>
          </Select>
        </Field>
        <Field label="Apalancamiento máximo">
          <Select value={leverage} onChange={onLeverage}>
            <option>1x</option>
            <option>2x</option>
            <option>3x</option>
            <option>5x</option>
          </Select>
        </Field>
      </div>
    </Card>
  );
}

function SafetyCard({
  safety,
  onSafety
}: {
  safety: Record<SafetyKey, boolean>;
  onSafety: (value: Record<SafetyKey, boolean>) => void;
}) {
  const update = (key: SafetyKey) =>
    onSafety({ ...safety, [key]: !safety[key] });

  return (
    <Card
      title="4. Filtros de seguridad"
      description="Evita operar en condiciones desfavorables"
    >
      <div className="space-y-3">
        {(Object.keys(safetyLabels) as SafetyKey[]).map((key) => (
          <div className="flex items-center gap-3" key={key}>
            <Toggle checked={safety[key]} onChange={() => update(key)} />
            <span className="min-w-0 flex-1 text-sm text-slate-300">
              {safetyLabels[key]}
            </span>
            <SafetyValue itemKey={key} />
          </div>
        ))}
      </div>
    </Card>
  );
}

function ScheduleCard({
  sessions,
  onSessions
}: {
  sessions: Record<SessionKey, boolean>;
  onSessions: (value: Record<SessionKey, boolean>) => void;
}) {
  const update = (key: SessionKey) =>
    onSessions({ ...sessions, [key]: !sessions[key] });

  return (
    <Card title="5. Horario de operación" description="Define cuándo el bot puede operar">
      <Field label="Zona horaria">
        <Select value="(UTC+1) Madrid" onChange={() => undefined}>
          <option>(UTC+1) Madrid</option>
        </Select>
      </Field>
      <div className="my-5 h-px bg-slate-700/65" />
      <div className="space-y-4">
        <SessionRow
          active={sessions.london}
          label="Sesión de Londres"
          time="07:00 - 16:00"
          onChange={() => update("london")}
        />
        <SessionRow
          active={sessions.newYork}
          label="Sesión de Nueva York"
          time="13:30 - 22:00"
          onChange={() => update("newYork")}
        />
        <SessionRow
          active={sessions.asia}
          label="Sesión de Asia"
          time="00:00 - 08:00"
          onChange={() => update("asia")}
        />
      </div>
      <div className="mt-7 rounded-lg border border-slate-700/75 bg-slate-950/35 p-3">
        <div className="relative h-12 overflow-hidden rounded border border-slate-700/60 bg-slate-900/80">
          <TimelineBlock active={sessions.asia} left="0%" width="33.333%" color="bg-slate-500" />
          <TimelineBlock active={sessions.london} left="29.167%" width="37.5%" color="bg-violet-500" />
          <TimelineBlock active={sessions.newYork} left="56.25%" width="35.417%" color="bg-blue-500" />
          <div className="absolute inset-x-0 top-1/2 h-px bg-slate-700/70" />
          <div className="absolute inset-y-0 left-1/4 w-px bg-slate-700/60" />
          <div className="absolute inset-y-0 left-1/2 w-px bg-slate-700/60" />
          <div className="absolute inset-y-0 left-3/4 w-px bg-slate-700/60" />
        </div>
        <div className="mt-2 flex justify-between text-xs text-slate-400">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>24:00</span>
        </div>
      </div>
    </Card>
  );
}

function AutomationCard({
  value,
  onChange
}: {
  value: AutomationMode;
  onChange: (value: AutomationMode) => void;
}) {
  return (
    <Card
      title="6. Nivel de automatización"
      description="Elige cuánto control tendrá el bot"
    >
      <div className="space-y-3">
        {automationModes.map((mode) => {
          const active = value === mode.title;
          return (
            <button
              key={mode.title}
              className={classNames(
                "flex w-full items-start gap-4 rounded-lg border px-4 py-4 text-left transition",
                active
                  ? "border-violet-400 bg-violet-500/15 shadow-violet"
                  : "border-slate-700/70 bg-slate-950/25 hover:border-slate-500"
              )}
              onClick={() => onChange(mode.title)}
            >
              <span
                className={classNames(
                  "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                  active
                    ? "border-violet-300 bg-violet-500"
                    : "border-slate-500"
                )}
              >
                {active && <Check className="h-3 w-3 text-white" />}
              </span>
              <span>
                <span
                  className={classNames(
                    "block text-sm font-semibold",
                    active ? "text-violet-200" : "text-slate-100"
                  )}
                >
                  {mode.label}
                </span>
                <span className="mt-1 block text-xs text-slate-400">
                  {mode.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

function RightPanel({
  asset,
  timeframe,
  marketMode,
  bias,
  risk,
  stopLoss,
  takeProfit,
  maxTrades,
  schedule,
  automationMode,
  activeFilters,
  dailyLoss,
  weeklyLoss,
  automationDescription
}: {
  asset: string;
  timeframe: string;
  marketMode: string;
  bias: string;
  risk: number;
  stopLoss: number;
  takeProfit: number;
  maxTrades: number;
  schedule: string;
  automationMode: string;
  activeFilters: number;
  dailyLoss: number;
  weeklyLoss: number;
  automationDescription: string;
}) {
  const rows = [
    { icon: CircleDollarSign, label: "Activo", value: asset },
    { icon: SlidersHorizontal, label: "Timeframe", value: timeframe },
    { icon: TrendingUp, label: "Modo de mercado", value: marketMode, accent: true },
    { icon: RotateCcw, label: "Sesgo", value: bias, accent: true },
    { icon: Gauge, label: "Riesgo por operación", value: `${risk.toFixed(2)}%` },
    { icon: ShieldCheck, label: "Stop Loss máx.", value: `${stopLoss.toFixed(2)}%` },
    { icon: Activity, label: "Take Profit", value: `${takeProfit.toFixed(2)}R` },
    { icon: CalendarClock, label: "Máx. operaciones/día", value: String(maxTrades) },
    { icon: LockKeyhole, label: "Horario", value: schedule },
    { icon: Bot, label: "Modo de automatización", value: automationMode },
    {
      icon: ListChecks,
      label: "Filtros activos",
      value: `${activeFilters} filtros habilitados`,
      accent: true
    }
  ];

  return (
    <aside className="space-y-5 xl:self-start">
      <div className="panel rounded-xl p-5">
        <h2 className="mb-5 text-sm font-bold uppercase tracking-wide">
          Resumen de configuración
        </h2>
        <div className="space-y-4">
          {rows.map((row) => {
            const Icon = row.icon;
            return (
              <div className="flex items-center gap-3 text-sm" key={row.label}>
                <Icon className="h-4 w-4 text-slate-400" />
                <span className="flex-1 text-slate-300">{row.label}</span>
                <span
                  className={classNames(
                    "max-w-36 text-right font-semibold",
                    row.accent ? "text-emerald-300" : "text-slate-100"
                  )}
                >
                  {row.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="panel rounded-xl p-5">
        <h2 className="mb-5 text-sm font-bold uppercase tracking-wide">
          Vista rápida
        </h2>
        <Progress label="Riesgo por operación" value={risk} max={5} suffix="%" />
        <Progress label="Riesgo diario máximo" value={dailyLoss} max={10} suffix="%" />
        <Progress label="Riesgo semanal máximo" value={weeklyLoss} max={15} suffix="%" />
      </div>

      <div className="panel rounded-xl p-5">
        <h2 className="mb-5 text-sm font-bold uppercase tracking-wide">
          Modo del bot
        </h2>
        <div className="rounded-lg border border-violet-400/50 bg-violet-500/15 p-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-violet-300" />
            <p className="font-semibold text-violet-200">{automationMode}</p>
          </div>
          <p className="mt-2 text-sm text-slate-300">{automationDescription}.</p>
        </div>
      </div>

      <div className="panel rounded-xl p-5">
        <div className="flex gap-3">
          <Info className="mt-0.5 h-5 w-5 text-blue-400" />
          <div>
            <h2 className="font-semibold">No olvides guardar tu configuración</h2>
            <p className="mt-2 text-sm text-slate-400">
              Guarda tus cambios para que el bot los aplique correctamente.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function BrokersPage({
  brokers,
  onSelectBroker,
  onTestConnection,
  onUpdateBroker,
  selectedBroker
}: {
  brokers: BrokerConnection[];
  onSelectBroker: (id: string) => void;
  onTestConnection: (id: string) => void;
  onUpdateBroker: (id: string, patch: Partial<BrokerConnection>) => void;
  selectedBroker: BrokerConnection;
}) {
  const connectedBrokers = brokers.filter(
    (broker) => broker.status === "Conectado"
  ).length;
  const demoBrokers = brokers.filter(
    (broker) => broker.environment === "Demo / Paper"
  ).length;
  const readyChecks = Object.values(selectedBroker.checks).filter(Boolean).length;
  const requiredChecks = Object.keys(connectionCheckLabels).length;
  const canSendOrders =
    selectedBroker.permissions.orders &&
    selectedBroker.permissions.modifyCancel &&
    selectedBroker.permissions.withdrawalsBlocked;

  return (
    <main className="grid gap-5 px-4 py-5 sm:px-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <section className="grid min-w-0 gap-5">
        <div className="grid gap-5 md:grid-cols-3">
          <MetricPanel
            icon={Network}
            label="Brokers configurados"
            value={String(brokers.length)}
            detail={`${connectedBrokers} conectados`}
          />
          <MetricPanel
            icon={ShieldCheck}
            label="Entorno seguro"
            value={`${demoBrokers}/${brokers.length}`}
            detail="Cuentas en demo o paper"
          />
          <MetricPanel
            icon={Radio}
            label="Checks del broker"
            value={`${readyChecks}/${requiredChecks}`}
            detail={selectedBroker.name}
          />
        </div>

        <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="space-y-4">
            {brokers.map((broker) => (
              <BrokerConnectionCard
                broker={broker}
                key={broker.id}
                selected={broker.id === selectedBroker.id}
                onSelect={() => onSelectBroker(broker.id)}
              />
            ))}
          </div>

          <BrokerEditor
            broker={selectedBroker}
            canSendOrders={canSendOrders}
            onTestConnection={() => onTestConnection(selectedBroker.id)}
            onUpdate={(patch) => onUpdateBroker(selectedBroker.id, patch)}
          />
        </div>
      </section>

      <BrokerSidePanel broker={selectedBroker} canSendOrders={canSendOrders} />
    </main>
  );
}

function BrokerConnectionCard({
  broker,
  selected,
  onSelect
}: {
  broker: BrokerConnection;
  selected: boolean;
  onSelect: () => void;
}) {
  const completedChecks = Object.values(broker.checks).filter(Boolean).length;

  return (
    <button
      className={classNames(
        "panel w-full rounded-xl p-5 text-left transition hover:-translate-y-0.5 hover:border-blue-400/60",
        selected && "border-blue-400/70 bg-blue-500/10"
      )}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {broker.category}
          </p>
          <h3 className="mt-2 text-lg font-bold">{broker.name}</h3>
        </div>
        <BrokerStatusBadge status={broker.status} />
      </div>
      <div className="mt-5 grid gap-3 text-sm">
        <BotMiniStat label="Entorno" value={broker.environment} />
        <BotMiniStat label="Instrumento" value={broker.primaryInstrument} />
        <BotMiniStat label="Prioridad" value={broker.priority} />
        <BotMiniStat label="Checks" value={`${completedChecks}/5`} />
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-400">{broker.notes}</p>
    </button>
  );
}

function BrokerEditor({
  broker,
  canSendOrders,
  onTestConnection,
  onUpdate
}: {
  broker: BrokerConnection;
  canSendOrders: boolean;
  onTestConnection: () => void;
  onUpdate: (patch: Partial<BrokerConnection>) => void;
}) {
  const updatePermission = (key: BrokerPermissionKey) =>
    onUpdate({
      permissions: {
        ...broker.permissions,
        [key]: !broker.permissions[key]
      }
    });
  const updateCheck = (key: ConnectionCheckKey) =>
    onUpdate({
      checks: {
        ...broker.checks,
        [key]: !broker.checks[key]
      }
    });
  const updateInstruments = (value: string) => {
    const instruments = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    onUpdate({
      instruments,
      primaryInstrument: instruments.includes(broker.primaryInstrument)
        ? broker.primaryInstrument
        : instruments[0] ?? broker.primaryInstrument
    });
  };

  return (
    <div className="grid gap-5">
      <Card
        title="Conexión del broker"
        description="Primero credenciales, luego pruebas, después permisos de órdenes"
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="Broker">
            <input
              className="field w-full"
              value={broker.name}
              onChange={(event) => onUpdate({ name: event.target.value })}
            />
          </Field>
          <Field label="Tipo de mercado">
            <input
              className="field w-full"
              value={broker.category}
              onChange={(event) => onUpdate({ category: event.target.value })}
            />
          </Field>
          <Field label="Entorno">
            <Select
              value={broker.environment}
              onChange={(value) =>
                onUpdate({ environment: value as BrokerEnvironment })
              }
            >
              <option>Demo / Paper</option>
              <option>Live</option>
            </Select>
          </Field>
          <Field label="Estado">
            <Select
              value={broker.status}
              onChange={(value) => onUpdate({ status: value as BrokerStatus })}
            >
              <option>Pendiente</option>
              <option>Conectado</option>
              <option>Error</option>
              <option>Desactivado</option>
            </Select>
          </Field>
          <Field label="Cuenta / alias">
            <input
              className="field w-full"
              value={broker.accountLabel}
              onChange={(event) => onUpdate({ accountLabel: event.target.value })}
            />
          </Field>
          <Field label="Base URL / gateway">
            <input
              className="field w-full"
              value={broker.baseUrl}
              onChange={(event) => onUpdate({ baseUrl: event.target.value })}
            />
          </Field>
          <Field label="API key / client id">
            <input
              className="field w-full"
              placeholder="Guardar cifrado en backend"
              value={broker.apiKey}
              onChange={(event) => onUpdate({ apiKey: event.target.value })}
            />
          </Field>
          <Field label="API secret / token">
            <input
              className="field w-full"
              placeholder="Nunca exponer en frontend real"
              type="password"
              value={broker.apiSecret}
              onChange={(event) => onUpdate({ apiSecret: event.target.value })}
            />
          </Field>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-emerald-400/70 bg-emerald-500/10 px-5 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
            onClick={onTestConnection}
          >
            <Radio className="h-4 w-4" />
            Probar conexión
          </button>
          <span
            className={classNames(
              "rounded-lg border px-3 py-2 text-sm",
              broker.environment === "Live"
                ? "border-amber-400/50 bg-amber-500/12 text-amber-200"
                : "border-blue-400/45 bg-blue-500/10 text-blue-200"
            )}
          >
            {broker.environment === "Live"
              ? "Live requiere aprobación manual"
              : "Recomendado para MVP"}
          </span>
          {!canSendOrders && (
            <span className="rounded-lg border border-rose-400/45 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              Órdenes bloqueadas por permisos
            </span>
          )}
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card
          title="Instrumentos permitidos"
          description="Limita lo que cada bot puede operar desde este broker"
        >
          <Field label="Lista de símbolos">
            <input
              className="field w-full"
              value={broker.instruments.join(", ")}
              onChange={(event) => updateInstruments(event.target.value)}
            />
          </Field>
          <Field label="Instrumento principal" className="mt-4">
            <Select
              value={broker.primaryInstrument}
              onChange={(value) => onUpdate({ primaryInstrument: value })}
            >
              {broker.instruments.map((instrument) => (
                <option key={instrument}>{instrument}</option>
              ))}
            </Select>
          </Field>
          <Field label="Datos de mercado" className="mt-4">
            <input
              className="field w-full"
              value={broker.marketDataPlan}
              onChange={(event) =>
                onUpdate({ marketDataPlan: event.target.value })
              }
            />
          </Field>
        </Card>

        <Card
          title="Límites del broker"
          description="Cortafuegos específico para ejecución automática"
        >
          <Field label="Contratos máximos por orden">
            <Select
              value={String(broker.maxContracts)}
              onChange={(value) => onUpdate({ maxContracts: Number(value) })}
            >
              <option>1</option>
              <option>2</option>
              <option>3</option>
              <option>5</option>
            </Select>
          </Field>
          <Field label="Pérdida diaria máxima" className="mt-4">
            <div className="field flex items-center gap-2">
              <input
                className="w-full bg-transparent text-right outline-none"
                min="0"
                type="number"
                value={broker.dailyLossLimit}
                onChange={(event) =>
                  onUpdate({ dailyLossLimit: Number(event.target.value) })
                }
              />
              <span className="text-slate-400">USD</span>
            </div>
          </Field>
          <Field label="Órdenes máximas por minuto" className="mt-4">
            <Select
              value={String(broker.orderThrottle)}
              onChange={(value) => onUpdate({ orderThrottle: Number(value) })}
            >
              <option>1</option>
              <option>2</option>
              <option>3</option>
              <option>5</option>
              <option>10</option>
            </Select>
          </Field>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card
          title="Permisos de API"
          description="Activa solo lo que el bot necesita para operar"
        >
          <div className="space-y-3">
            {(Object.keys(brokerPermissionLabels) as BrokerPermissionKey[]).map(
              (key) => (
                <div className="flex items-center gap-3" key={key}>
                  <Toggle
                    checked={broker.permissions[key]}
                    onChange={() => updatePermission(key)}
                  />
                  <span className="min-w-0 flex-1 text-sm text-slate-300">
                    {brokerPermissionLabels[key]}
                  </span>
                </div>
              )
            )}
          </div>
        </Card>

        <Card
          title="Checklist de conexión"
          description="Todo debe pasar en demo antes de habilitar live"
        >
          <div className="space-y-3">
            {(Object.keys(connectionCheckLabels) as ConnectionCheckKey[]).map(
              (key) => (
                <button
                  className="flex w-full items-center gap-3 rounded-lg border border-slate-700/70 bg-slate-950/30 px-3 py-3 text-left transition hover:border-slate-500"
                  key={key}
                  onClick={() => updateCheck(key)}
                >
                  <span
                    className={classNames(
                      "flex h-6 w-6 items-center justify-center rounded-full border",
                      broker.checks[key]
                        ? "border-emerald-300 bg-emerald-500 text-slate-950"
                        : "border-slate-600 text-slate-500"
                    )}
                  >
                    {broker.checks[key] && <Check className="h-4 w-4" />}
                  </span>
                  <span className="text-sm text-slate-300">
                    {connectionCheckLabels[key]}
                  </span>
                </button>
              )
            )}
          </div>
        </Card>
      </div>

      <Card
        title="Notas de integración"
        description="Contexto técnico para el backend que conectará el motor del bot"
      >
        <textarea
          className="min-h-24 w-full rounded-lg border border-slate-700/80 bg-slate-950/55 px-3 py-3 text-sm text-slate-100 outline-none transition focus:border-blue-400"
          value={broker.notes}
          onChange={(event) => onUpdate({ notes: event.target.value })}
        />
      </Card>
    </div>
  );
}

function BrokerSidePanel({
  broker,
  canSendOrders
}: {
  broker: BrokerConnection;
  canSendOrders: boolean;
}) {
  const completedChecks = Object.values(broker.checks).filter(Boolean).length;
  const allChecksReady =
    completedChecks === Object.keys(connectionCheckLabels).length;
  const readyForLive =
    broker.environment === "Demo / Paper" &&
    allChecksReady &&
    canSendOrders &&
    broker.status === "Conectado";

  return (
    <aside className="space-y-5 xl:self-start">
      <div className="panel rounded-xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Broker seleccionado
            </p>
            <h2 className="mt-2 text-2xl font-bold">{broker.name}</h2>
            <p className="mt-1 text-sm text-slate-400">{broker.category}</p>
          </div>
          <BrokerStatusBadge status={broker.status} />
        </div>
        <div className="mt-5 grid gap-3 text-sm">
          <BotMiniStat label="Cuenta" value={broker.accountLabel} />
          <BotMiniStat label="Entorno" value={broker.environment} />
          <BotMiniStat label="Instrumento" value={broker.primaryInstrument} />
          <BotMiniStat label="Última prueba" value={broker.lastSync} />
        </div>
      </div>

      <div className="panel rounded-xl p-5">
        <h2 className="mb-5 text-sm font-bold uppercase tracking-wide">
          Preparación live
        </h2>
        <Progress label="Checklist" value={completedChecks} max={5} suffix="/5" />
        <div
          className={classNames(
            "rounded-lg border p-4 text-sm",
            readyForLive
              ? "border-emerald-400/50 bg-emerald-500/12 text-emerald-200"
              : "border-amber-400/45 bg-amber-500/10 text-amber-100"
          )}
        >
          {readyForLive
            ? "Listo para revisión humana antes de pasar a live."
            : "Mantener en demo hasta completar permisos, dry-run y límites."}
        </div>
      </div>

      <div className="panel rounded-xl p-5">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide">
          Reglas recomendadas
        </h2>
        <div className="space-y-3 text-sm text-slate-300">
          <BrokerRule icon={ShieldCheck} text="Empezar con MNQ, no NQ." />
          <BrokerRule icon={LockKeyhole} text="Guardar secretos cifrados solo en backend." />
          <BrokerRule icon={AlertTriangle} text="Bloquear live si falla cualquier check." />
          <BrokerRule icon={Activity} text="Registrar cada orden, rechazo y modificación." />
        </div>
      </div>

      <div className="panel rounded-xl p-5">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide">
          Flujo ideal
        </h2>
        <div className="space-y-3 text-sm">
          {[
            "Credenciales demo",
            "Datos en tiempo real",
            "Orden dry-run",
            "Bot en solo señales",
            "Aprobación manual para live"
          ].map((step, index) => (
            <div className="flex items-center gap-3" key={step}>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-blue-400/40 bg-blue-500/10 text-xs font-bold text-blue-200">
                {index + 1}
              </span>
              <span className="text-slate-300">{step}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

function BrokerRule({
  icon: Icon,
  text
}: {
  icon: typeof ShieldCheck;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-blue-300" />
      <span>{text}</span>
    </div>
  );
}

function BrokerStatusBadge({ status }: { status: BrokerStatus }) {
  const styles: Record<BrokerStatus, string> = {
    Conectado: "border-emerald-400/40 bg-emerald-500/12 text-emerald-300",
    Pendiente: "border-amber-400/40 bg-amber-500/12 text-amber-300",
    Error: "border-rose-400/40 bg-rose-500/12 text-rose-300",
    Desactivado: "border-slate-500/40 bg-slate-700/25 text-slate-300"
  };

  return (
    <span
      className={classNames(
        "rounded-full border px-3 py-1 text-xs font-semibold",
        styles[status]
      )}
    >
      {status}
    </span>
  );
}

function TemplatesPage({
  bots,
  creatingTemplate,
  currentConfig,
  indicators,
  onApplyTemplate,
  onCreateTemplate,
  onCreatingTemplateChange,
  onSelectTemplate,
  onUpdateTemplate,
  selectedTemplate,
  templates
}: {
  bots: StrategyBot[];
  creatingTemplate: boolean;
  currentConfig: BotConfiguration;
  indicators: Indicator[];
  onApplyTemplate: (template: TradingTemplate) => void;
  onCreateTemplate: (template: TradingTemplate) => void;
  onCreatingTemplateChange: (creating: boolean) => void;
  onSelectTemplate: (id: string) => void;
  onUpdateTemplate: (id: string, patch: Partial<TradingTemplate>) => void;
  selectedTemplate: TradingTemplate;
  templates: TradingTemplate[];
}) {
  const activeTemplates = templates.filter(
    (template) => template.status === "Activa"
  ).length;
  const linkedBots = new Set(templates.flatMap((template) => template.botIds));
  const linkedIndicators = new Set(
    templates.flatMap((template) => template.indicatorIds)
  );

  return (
    <main className="grid gap-5 px-4 py-5 sm:px-6 xl:grid-cols-[minmax(0,1fr)_440px]">
      <section className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricPanel
            icon={ClipboardList}
            label="Plantillas"
            value={String(templates.length)}
            detail={`${activeTemplates} activas`}
          />
          <MetricPanel
            icon={Bot}
            label="Bots relacionados"
            value={String(linkedBots.size)}
            detail="en plantillas"
          />
          <MetricPanel
            icon={Activity}
            label="Indicadores"
            value={String(linkedIndicators.size)}
            detail="reutilizados"
          />
        </div>

        {creatingTemplate && (
          <NewTemplatePanel
            currentConfig={currentConfig}
            existingIds={templates.map((template) => template.id)}
            indicators={indicators}
            bots={bots}
            onCancel={() => onCreatingTemplateChange(false)}
            onCreate={(template) => {
              onCreateTemplate(template);
              onCreatingTemplateChange(false);
            }}
          />
        )}

        <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
          {templates.map((template) => (
            <TemplateCard
              bots={bots}
              indicators={indicators}
              key={template.id}
              onApply={() => onApplyTemplate(template)}
              onSelect={() => onSelectTemplate(template.id)}
              selected={template.id === selectedTemplate.id}
              template={template}
            />
          ))}
        </div>
      </section>

      <aside className="space-y-5 xl:sticky xl:top-28 xl:self-start">
        <TemplateEditor
          bots={bots}
          indicators={indicators}
          onApply={() => onApplyTemplate(selectedTemplate)}
          onUpdate={(patch) => onUpdateTemplate(selectedTemplate.id, patch)}
          template={selectedTemplate}
        />
      </aside>
    </main>
  );
}

function NewTemplatePanel({
  bots,
  currentConfig,
  existingIds,
  indicators,
  onCancel,
  onCreate
}: {
  bots: StrategyBot[];
  currentConfig: BotConfiguration;
  existingIds: string[];
  indicators: Indicator[];
  onCancel: () => void;
  onCreate: (template: TradingTemplate) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [botIds, setBotIds] = useState<string[]>(bots[0] ? [bots[0].id] : []);
  const [indicatorIds, setIndicatorIds] = useState<string[]>(
    indicators.slice(0, 2).map((indicator) => indicator.id)
  );
  const canCreate = name.trim().length > 1;

  const create = () => {
    if (!canCreate) return;

    const baseId = slugify(name) || `template-${existingIds.length + 1}`;
    let id = baseId;
    let suffix = 2;
    while (existingIds.includes(id)) {
      id = `${baseId}-${suffix}`;
      suffix += 1;
    }

    onCreate({
      id,
      name: name.trim(),
      description:
        description.trim() ||
        "Plantilla creada desde la configuración actual para reutilizar bots e indicadores.",
      status: "Borrador",
      botIds,
      indicatorIds,
      config: currentConfig
    });
  };

  return (
    <div className="panel rounded-xl p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide">
            Nueva plantilla
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Guarda una composición de bots, indicadores y configuración.
          </p>
        </div>
        <button
          className="rounded-lg border border-slate-700/80 px-3 py-2 text-sm text-slate-300 transition hover:border-slate-500"
          onClick={onCancel}
        >
          Cancelar
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Field label="Nombre">
          <input
            className="field w-full"
            placeholder="Swing BTC conservador"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </Field>
        <Field label="Descripción">
          <input
            className="field w-full"
            placeholder="Cuándo usar esta plantilla"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </Field>
        <RelationPicker
          className="lg:col-span-2"
          items={bots}
          label="Bots"
          selectedIds={botIds}
          onChange={setBotIds}
        />
        <RelationPicker
          className="lg:col-span-2"
          items={indicators}
          label="Indicadores"
          selectedIds={indicatorIds}
          onChange={setIndicatorIds}
        />
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <p className="text-sm text-slate-400">
          Configuración: {describeTemplateConfig(currentConfig)}
        </p>
        <button
          className={classNames(
            "inline-flex h-11 items-center gap-2 rounded-lg px-5 text-sm font-semibold transition",
            canCreate
              ? "bg-emerald-400 text-slate-950 hover:bg-emerald-300"
              : "cursor-not-allowed bg-slate-700 text-slate-400"
          )}
          disabled={!canCreate}
          onClick={create}
        >
          <Plus className="h-4 w-4" />
          Crear plantilla
        </button>
      </div>
    </div>
  );
}

function TemplateCard({
  bots,
  indicators,
  onApply,
  onSelect,
  selected,
  template
}: {
  bots: StrategyBot[];
  indicators: Indicator[];
  onApply: () => void;
  onSelect: () => void;
  selected: boolean;
  template: TradingTemplate;
}) {
  const botNames = bots
    .filter((bot) => template.botIds.includes(bot.id))
    .map((bot) => bot.name);
  const indicatorNames = indicators
    .filter((indicator) => template.indicatorIds.includes(indicator.id))
    .map((indicator) => indicator.name);

  return (
    <div
      className={classNames(
        "panel rounded-xl p-5 transition hover:-translate-y-0.5 hover:border-blue-400/60",
        selected && "border-blue-400/70 bg-blue-500/10"
      )}
    >
      <button className="w-full text-left" onClick={onSelect}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold">{template.name}</h3>
            <p className="mt-1 text-sm text-slate-400">
              {describeTemplateConfig(template.config)}
            </p>
          </div>
          <TemplateStatusBadge status={template.status} />
        </div>
        <p className="mt-5 min-h-12 text-sm leading-6 text-slate-300">
          {template.description}
        </p>
      </button>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <BotMiniStat label="Bots" value={String(template.botIds.length)} />
        <BotMiniStat
          label="Indicadores"
          value={String(template.indicatorIds.length)}
        />
      </div>

      <div className="mt-4 space-y-2 text-sm text-slate-400">
        <p>Bots: {botNames.length ? botNames.join(", ") : "Sin bots"}</p>
        <p>
          Indicadores:{" "}
          {indicatorNames.length ? indicatorNames.join(", ") : "Sin indicadores"}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-700/60 pt-4">
        <button
          className="text-sm font-semibold text-blue-300 transition hover:text-blue-200"
          onClick={onSelect}
        >
          Editar relaciones
        </button>
        <button
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-emerald-400/60 bg-emerald-500/10 px-4 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
          onClick={onApply}
        >
          <Check className="h-4 w-4" />
          Aplicar
        </button>
      </div>
    </div>
  );
}

function TemplateEditor({
  bots,
  indicators,
  onApply,
  onUpdate,
  template
}: {
  bots: StrategyBot[];
  indicators: Indicator[];
  onApply: () => void;
  onUpdate: (patch: Partial<TradingTemplate>) => void;
  template: TradingTemplate;
}) {
  const updateConfig = (patch: Partial<BotConfiguration>) => {
    onUpdate({ config: { ...template.config, ...patch } });
  };

  return (
    <div className="panel rounded-xl p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Editar plantilla
          </p>
          <h2 className="mt-2 text-2xl font-bold">{template.name}</h2>
          <p className="mt-1 text-sm text-slate-400">
            {describeTemplateConfig(template.config)}
          </p>
        </div>
        <TemplateStatusBadge status={template.status} />
      </div>

      <div className="space-y-4">
        <Field label="Nombre">
          <input
            className="field w-full"
            value={template.name}
            onChange={(event) => onUpdate({ name: event.target.value })}
          />
        </Field>
        <Field label="Descripción">
          <textarea
            className="min-h-24 w-full rounded-lg border border-slate-700/80 bg-slate-950/55 px-3 py-3 text-sm text-slate-100 outline-none transition focus:border-blue-400"
            value={template.description}
            onChange={(event) => onUpdate({ description: event.target.value })}
          />
        </Field>
        <Field label="Estado">
          <Select
            value={template.status}
            onChange={(value) => onUpdate({ status: value as TemplateStatus })}
          >
            <option>Activa</option>
            <option>Borrador</option>
            <option>Archivada</option>
          </Select>
        </Field>

        <RelationPicker
          items={bots}
          label="Bots relacionados"
          selectedIds={template.botIds}
          onChange={(botIds) => onUpdate({ botIds })}
        />
        <RelationPicker
          items={indicators}
          label="Indicadores relacionados"
          selectedIds={template.indicatorIds}
          onChange={(indicatorIds) => onUpdate({ indicatorIds })}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Activo">
            <Select
              value={template.config.asset}
              onChange={(asset) => updateConfig({ asset })}
            >
              <option>BTC/USDT</option>
              <option>ETH/USDT</option>
              <option>NASDAQ</option>
              <option>EUR/USD</option>
            </Select>
          </Field>
          <Field label="Timeframe">
            <Select
              value={template.config.timeframe}
              onChange={(timeframe) => updateConfig({ timeframe })}
            >
              <option>1m</option>
              <option>5m</option>
              <option>15m</option>
              <option>30m</option>
              <option>1h</option>
            </Select>
          </Field>
          <Field label="Riesgo">
            <input
              className="field w-full"
              type="number"
              min="0.1"
              max="5"
              step="0.1"
              value={template.config.risk}
              onChange={(event) => updateConfig({ risk: Number(event.target.value) })}
            />
          </Field>
          <Field label="Máx. operaciones">
            <input
              className="field w-full"
              type="number"
              min="1"
              max="12"
              value={template.config.maxTrades}
              onChange={(event) =>
                updateConfig({ maxTrades: Number(event.target.value) })
              }
            />
          </Field>
        </div>
      </div>

      <button
        className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-emerald-400/60 bg-emerald-500/10 px-5 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
        onClick={onApply}
      >
        <Check className="h-4 w-4" />
        Aplicar plantilla
      </button>
    </div>
  );
}

function RelationPicker<T extends { id: string; name: string }>({
  className,
  items,
  label,
  selectedIds,
  onChange
}: {
  className?: string;
  items: T[];
  label: string;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  return (
    <Field label={label} className={className}>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <label
            className="flex items-center gap-3 rounded-lg border border-slate-700/70 bg-slate-950/35 px-3 py-2 text-sm text-slate-200"
            key={item.id}
          >
            <input
              checked={selectedIds.includes(item.id)}
              className="h-4 w-4 accent-blue-400"
              type="checkbox"
              onChange={(event) =>
                onChange(updateIdSelection(selectedIds, item.id, event.target.checked))
              }
            />
            <span>{item.name}</span>
          </label>
        ))}
      </div>
    </Field>
  );
}

function TemplateStatusBadge({ status }: { status: TemplateStatus }) {
  const styles = {
    Activa: "border-emerald-400/40 bg-emerald-500/12 text-emerald-300",
    Borrador: "border-amber-400/40 bg-amber-500/12 text-amber-300",
    Archivada: "border-slate-500/40 bg-slate-700/25 text-slate-300"
  };

  return (
    <span
      className={classNames(
        "rounded-full border px-3 py-1 text-xs font-semibold",
        styles[status]
      )}
    >
      {status}
    </span>
  );
}

function BotsPage({
  bots,
  creatingBot,
  onCreateBot,
  onCreatingBotChange,
  selectedBot,
  onSelectBot,
  onUpdateBot
}: {
  bots: StrategyBot[];
  creatingBot: boolean;
  onCreateBot: (bot: StrategyBot) => void;
  onCreatingBotChange: (creating: boolean) => void;
  selectedBot: StrategyBot;
  onSelectBot: (id: string) => void;
  onUpdateBot: (id: string, patch: Partial<StrategyBot>) => void;
}) {
  const activeBots = bots.filter((bot) => bot.status === "Activo").length;
  const pausedBots = bots.filter((bot) => bot.status === "Pausado").length;
  const totalTrades = bots.reduce((sum, bot) => sum + bot.trades, 0);

  return (
    <main className="grid gap-5 px-4 py-5 sm:px-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <section className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricPanel
            icon={Bot}
            label="Bots creados"
            value={String(bots.length)}
            detail={`${activeBots} activos`}
          />
          <MetricPanel
            icon={Cpu}
            label="Estrategias"
            value="6"
            detail={`${pausedBots} en pausa`}
          />
          <MetricPanel
            icon={BarChart3}
            label="Operaciones"
            value={String(totalTrades)}
            detail="último ciclo mock"
          />
        </div>

        {creatingBot && (
          <NewBotPanel
            existingIds={bots.map((bot) => bot.id)}
            onCancel={() => onCreatingBotChange(false)}
            onCreate={(bot) => {
              onCreateBot(bot);
              onCreatingBotChange(false);
            }}
          />
        )}

        <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
          {bots.map((bot) => (
            <BotStrategyCard
              bot={bot}
              key={bot.id}
              selected={bot.id === selectedBot.id}
              onSelect={() => onSelectBot(bot.id)}
            />
          ))}
        </div>
      </section>

      <aside className="space-y-5 xl:sticky xl:top-28 xl:self-start">
        <BotEditor bot={selectedBot} onUpdate={onUpdateBot} />

        <div className="panel overflow-hidden rounded-xl">
          <div className="flex items-center justify-between gap-4 border-b border-slate-700/70 px-5 py-4">
            <div className="flex items-center gap-3">
              <FileCode2 className="h-5 w-5 text-blue-300" />
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wide">
                  Código fuente
                </h2>
                <p className="text-xs text-slate-500">
                  strategies/{selectedBot.id}.ts
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-md border border-slate-700/70 bg-slate-950/50 px-2 py-1 text-xs text-slate-400">
              <GitBranch className="h-3.5 w-3.5" />
              main
            </div>
          </div>
          <pre className="max-h-[520px] overflow-auto bg-slate-950/65 p-5 text-xs leading-6 text-slate-200">
            <code>{selectedBot.source}</code>
          </pre>
        </div>
      </aside>
    </main>
  );
}

function NewBotPanel({
  existingIds,
  onCancel,
  onCreate
}: {
  existingIds: string[];
  onCancel: () => void;
  onCreate: (bot: StrategyBot) => void;
}) {
  const [name, setName] = useState("");
  const [strategy, setStrategy] = useState("");
  const [market, setMarket] = useState("BTC/USDT");
  const [timeframe, setTimeframe] = useState("15m");
  const [risk, setRisk] = useState("1.00%");
  const [description, setDescription] = useState("");

  const canCreate = name.trim().length > 1 && strategy.trim().length > 1;

  const create = () => {
    if (!canCreate) return;

    const baseId = slugify(name) || `bot-${existingIds.length + 1}`;
    let id = baseId;
    let suffix = 2;
    while (existingIds.includes(id)) {
      id = `${baseId}-${suffix}`;
      suffix += 1;
    }

    const bot: StrategyBot = {
      id,
      name: name.trim(),
      strategy: strategy.trim(),
      market,
      timeframe,
      status: "Detenido",
      risk,
      pnl: "+0.0%",
      trades: 0,
      accent: "from-blue-400 to-violet-300",
      description:
        description.trim() ||
        "Nuevo bot preparado para definir condiciones de entrada, riesgo y automatización.",
      source: generateBotSource({
        name: name.trim(),
        strategy: strategy.trim(),
        market,
        timeframe,
        risk
      })
    };

    onCreate(bot);
  };

  return (
    <div className="panel rounded-xl p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide">
            Nuevo bot
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Crea una nueva estrategia mock para gestionarla desde la plataforma.
          </p>
        </div>
        <button
          className="rounded-lg border border-slate-700/80 px-3 py-2 text-sm text-slate-300 transition hover:border-slate-500"
          onClick={onCancel}
        >
          Cancelar
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Field label="Nombre">
          <input
            className="field w-full"
            placeholder="Gold"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </Field>
        <Field label="Estrategia">
          <input
            className="field w-full"
            placeholder="Momentum intradía"
            value={strategy}
            onChange={(event) => setStrategy(event.target.value)}
          />
        </Field>
        <Field label="Mercado">
          <Select value={market} onChange={setMarket}>
            <option>BTC/USDT</option>
            <option>ETH/USDT</option>
            <option>NASDAQ</option>
            <option>EUR/USD</option>
          </Select>
        </Field>
        <Field label="Timeframe">
          <Select value={timeframe} onChange={setTimeframe}>
            <option>1m</option>
            <option>5m</option>
            <option>15m</option>
            <option>30m</option>
            <option>1h</option>
          </Select>
        </Field>
        <Field label="Riesgo por operación">
          <input
            className="field w-full"
            value={risk}
            onChange={(event) => setRisk(event.target.value)}
          />
        </Field>
        <Field label="Descripción">
          <input
            className="field w-full"
            placeholder="Describe el comportamiento del bot"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </Field>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          className={classNames(
            "inline-flex h-11 items-center gap-2 rounded-lg px-5 text-sm font-semibold transition",
            canCreate
              ? "bg-emerald-400 text-slate-950 hover:bg-emerald-300"
              : "cursor-not-allowed bg-slate-700 text-slate-400"
          )}
          disabled={!canCreate}
          onClick={create}
        >
          <Plus className="h-4 w-4" />
          Crear bot
        </button>
      </div>
    </div>
  );
}

function BotEditor({
  bot,
  onUpdate
}: {
  bot: StrategyBot;
  onUpdate: (id: string, patch: Partial<StrategyBot>) => void;
}) {
  return (
    <div className="panel rounded-xl p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Editar bot
          </p>
          <h2 className="mt-2 text-2xl font-bold">{bot.name}</h2>
          <p className="mt-1 text-sm text-slate-400">{bot.strategy}</p>
        </div>
        <StatusBadge status={bot.status} />
      </div>

      <div className="space-y-4">
        <Field label="Nombre">
          <input
            className="field w-full"
            value={bot.name}
            onChange={(event) => onUpdate(bot.id, { name: event.target.value })}
          />
        </Field>
        <Field label="Estrategia">
          <input
            className="field w-full"
            value={bot.strategy}
            onChange={(event) =>
              onUpdate(bot.id, { strategy: event.target.value })
            }
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          <Field label="Mercado">
            <Select
              value={bot.market}
              onChange={(value) => onUpdate(bot.id, { market: value })}
            >
              <option>BTC/USDT</option>
              <option>ETH/USDT</option>
              <option>NASDAQ</option>
              <option>EUR/USD</option>
            </Select>
          </Field>
          <Field label="Timeframe">
            <Select
              value={bot.timeframe}
              onChange={(value) => onUpdate(bot.id, { timeframe: value })}
            >
              <option>1m</option>
              <option>5m</option>
              <option>15m</option>
              <option>30m</option>
              <option>1h</option>
            </Select>
          </Field>
          <Field label="Estado">
            <Select
              value={bot.status}
              onChange={(value) =>
                onUpdate(bot.id, { status: value as StrategyBot["status"] })
              }
            >
              <option>Activo</option>
              <option>Pausado</option>
              <option>Detenido</option>
            </Select>
          </Field>
          <Field label="Riesgo">
            <input
              className="field w-full"
              value={bot.risk}
              onChange={(event) => onUpdate(bot.id, { risk: event.target.value })}
            />
          </Field>
        </div>
        <Field label="Descripción">
          <textarea
            className="min-h-24 w-full rounded-lg border border-slate-700/80 bg-slate-950/55 px-3 py-3 text-sm text-slate-100 outline-none transition focus:border-blue-400"
            value={bot.description}
            onChange={(event) =>
              onUpdate(bot.id, { description: event.target.value })
            }
          />
        </Field>
      </div>

      <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <BotMiniStat label="PnL mock" value={bot.pnl} positive={bot.pnl.startsWith("+")} />
        <BotMiniStat label="Operaciones" value={String(bot.trades)} />
      </div>

      <div className="mt-5 flex items-center gap-2 rounded-lg border border-blue-400/35 bg-blue-500/10 px-3 py-3 text-sm text-blue-100">
        <Eye className="h-4 w-4" />
        Los cambios actualizan la card y regeneran el código mock del bot.
      </div>
    </div>
  );
}

function IndicatorsPage({
  creatingIndicator,
  indicators,
  onCreateIndicator,
  onCreatingIndicatorChange,
  onSelectIndicator,
  onUpdateIndicator,
  selectedIndicator
}: {
  creatingIndicator: boolean;
  indicators: Indicator[];
  onCreateIndicator: (indicator: Indicator) => void;
  onCreatingIndicatorChange: (creating: boolean) => void;
  onSelectIndicator: (id: string) => void;
  onUpdateIndicator: (id: string, patch: Partial<Indicator>) => void;
  selectedIndicator: Indicator;
}) {
  const activeIndicators = indicators.filter(
    (indicator) => indicator.status === "Activo"
  ).length;
  const experimentalIndicators = indicators.filter(
    (indicator) => indicator.status === "Experimental"
  ).length;
  const linkedBots = new Set(indicators.flatMap((indicator) => indicator.usedBy));

  return (
    <main className="grid gap-5 px-4 py-5 sm:px-6 xl:grid-cols-[minmax(0,1fr)_440px]">
      <section className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricPanel
            icon={Activity}
            label="Indicadores"
            value={String(indicators.length)}
            detail={`${activeIndicators} activos`}
          />
          <MetricPanel
            icon={Sparkles}
            label="Experimentales"
            value={String(experimentalIndicators)}
            detail="en validación"
          />
          <MetricPanel
            icon={Bot}
            label="Bots vinculados"
            value={String(linkedBots.size)}
            detail="usan indicadores"
          />
        </div>

        {creatingIndicator && (
          <NewIndicatorPanel
            existingIds={indicators.map((indicator) => indicator.id)}
            onCancel={() => onCreatingIndicatorChange(false)}
            onCreate={(indicator) => {
              onCreateIndicator(indicator);
              onCreatingIndicatorChange(false);
            }}
          />
        )}

        <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
          {indicators.map((indicator) => (
            <IndicatorCard
              indicator={indicator}
              key={indicator.id}
              onSelect={() => onSelectIndicator(indicator.id)}
              onUpdate={(patch) => onUpdateIndicator(indicator.id, patch)}
              selected={indicator.id === selectedIndicator.id}
            />
          ))}
        </div>
      </section>

      <aside className="space-y-5 xl:sticky xl:top-28 xl:self-start">
        <IndicatorEditor
          indicator={selectedIndicator}
          onUpdate={onUpdateIndicator}
        />

        <div className="panel overflow-hidden rounded-xl">
          <div className="flex items-center justify-between gap-4 border-b border-slate-700/70 px-5 py-4">
            <div className="flex items-center gap-3">
              <FileCode2 className="h-5 w-5 text-blue-300" />
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wide">
                  Código fuente editable
                </h2>
                <p className="text-xs text-slate-500">
                  indicators/{selectedIndicator.id}.ts
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-md border border-slate-700/70 bg-slate-950/50 px-2 py-1 text-xs text-slate-400">
              <Code2 className="h-3.5 w-3.5" />
              TS
            </div>
          </div>
          <textarea
            className="min-h-[420px] w-full resize-y bg-slate-950/65 p-5 font-mono text-xs leading-6 text-slate-200 outline-none"
            spellCheck={false}
            value={selectedIndicator.source}
            onChange={(event) =>
              onUpdateIndicator(selectedIndicator.id, {
                source: event.target.value
              })
            }
          />
        </div>
      </aside>
    </main>
  );
}

function NewIndicatorPanel({
  existingIds,
  onCancel,
  onCreate
}: {
  existingIds: string[];
  onCancel: () => void;
  onCreate: (indicator: Indicator) => void;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Tendencia");
  const [output, setOutput] = useState("signal");
  const [timeframe, setTimeframe] = useState("Multi");
  const [description, setDescription] = useState("");

  const canCreate = name.trim().length > 1 && output.trim().length > 1;

  const create = () => {
    if (!canCreate) return;

    const baseId = slugify(name) || `indicator-${existingIds.length + 1}`;
    let id = baseId;
    let suffix = 2;
    while (existingIds.includes(id)) {
      id = `${baseId}-${suffix}`;
      suffix += 1;
    }

    const indicator: Indicator = {
      id,
      name: name.trim(),
      category,
      output: output.trim(),
      timeframe,
      status: "Experimental",
      usedBy: [],
      description:
        description.trim() ||
        "Nuevo indicador listo para ajustar su cálculo y salida.",
      accent: "from-blue-400 to-violet-300",
      source: generateIndicatorSource({
        name: name.trim(),
        category,
        output: output.trim(),
        timeframe
      })
    };

    onCreate(indicator);
  };

  return (
    <div className="panel rounded-xl p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide">
            Nuevo indicador
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Define una señal reutilizable para componer bots.
          </p>
        </div>
        <button
          className="rounded-lg border border-slate-700/80 px-3 py-2 text-sm text-slate-300 transition hover:border-slate-500"
          onClick={onCancel}
        >
          Cancelar
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Field label="Nombre">
          <input
            className="field w-full"
            placeholder="MACD Signal"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </Field>
        <Field label="Categoría">
          <Select value={category} onChange={setCategory}>
            <option>Tendencia</option>
            <option>Momentum</option>
            <option>Volumen</option>
            <option>Volatilidad</option>
            <option>Precio</option>
            <option>Seguridad</option>
          </Select>
        </Field>
        <Field label="Salida">
          <input
            className="field w-full"
            placeholder="macdSignal"
            value={output}
            onChange={(event) => setOutput(event.target.value)}
          />
        </Field>
        <Field label="Timeframe">
          <Select value={timeframe} onChange={setTimeframe}>
            <option>Multi</option>
            <option>1m</option>
            <option>5m</option>
            <option>15m</option>
            <option>30m</option>
            <option>1h</option>
            <option>Sesión</option>
          </Select>
        </Field>
        <Field label="Descripción" className="lg:col-span-2">
          <input
            className="field w-full"
            placeholder="Qué mide y cuándo debería usarse"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </Field>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          className={classNames(
            "inline-flex h-11 items-center gap-2 rounded-lg px-5 text-sm font-semibold transition",
            canCreate
              ? "bg-emerald-400 text-slate-950 hover:bg-emerald-300"
              : "cursor-not-allowed bg-slate-700 text-slate-400"
          )}
          disabled={!canCreate}
          onClick={create}
        >
          <Plus className="h-4 w-4" />
          Crear indicador
        </button>
      </div>
    </div>
  );
}

function IndicatorCard({
  indicator,
  onSelect,
  onUpdate,
  selected
}: {
  indicator: Indicator;
  onSelect: () => void;
  onUpdate: (patch: Partial<Indicator>) => void;
  selected: boolean;
}) {
  return (
    <div
      className={classNames(
        "panel rounded-xl p-5 transition hover:-translate-y-0.5 hover:border-blue-400/60",
        selected && "border-blue-400/70 bg-blue-500/10"
      )}
    >
      <button className="w-full text-left" onClick={onSelect}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={classNames(
                "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-black uppercase text-slate-950 shadow-glow",
                indicator.accent
              )}
            >
              {indicator.name.slice(0, 2)}
            </div>
            <div>
              <h3 className="text-lg font-bold">{indicator.name}</h3>
              <p className="mt-1 text-sm text-slate-400">
                {indicator.category}
              </p>
            </div>
          </div>
          <IndicatorStatusBadge status={indicator.status} />
        </div>
      </button>

      <div className="mt-5 grid gap-3 text-sm">
        <Field label="Nombre">
          <input
            className="field w-full"
            value={indicator.name}
            onChange={(event) => onUpdate({ name: event.target.value })}
            onFocus={onSelect}
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Categoría">
            <Select
              value={indicator.category}
              onChange={(value) => onUpdate({ category: value })}
            >
              <option>Tendencia</option>
              <option>Momentum</option>
              <option>Volumen</option>
              <option>Volatilidad</option>
              <option>Precio</option>
              <option>Seguridad</option>
            </Select>
          </Field>
          <Field label="Estado">
            <Select
              value={indicator.status}
              onChange={(value) =>
                onUpdate({ status: value as Indicator["status"] })
              }
            >
              <option>Activo</option>
              <option>Experimental</option>
              <option>Archivado</option>
            </Select>
          </Field>
          <Field label="Salida">
            <input
              className="field w-full"
              value={indicator.output}
              onChange={(event) => onUpdate({ output: event.target.value })}
              onFocus={onSelect}
            />
          </Field>
          <Field label="Timeframe">
            <Select
              value={indicator.timeframe}
              onChange={(value) => onUpdate({ timeframe: value })}
            >
              <option>Multi</option>
              <option>1m</option>
              <option>5m</option>
              <option>15m</option>
              <option>30m</option>
              <option>1h</option>
              <option>Sesión</option>
            </Select>
          </Field>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-300">
        {indicator.description}
      </p>
      <div className="mt-4 flex items-center justify-between border-t border-slate-700/60 pt-4 text-sm">
        <span className="text-slate-400">
          Usado por: {indicator.usedBy.length ? indicator.usedBy.join(", ") : "Sin bots"}
        </span>
        <button
          className="flex items-center gap-2 text-blue-300 transition hover:text-blue-200"
          onClick={onSelect}
        >
          <Code2 className="h-4 w-4" />
          Código
        </button>
      </div>
    </div>
  );
}

function IndicatorEditor({
  indicator,
  onUpdate
}: {
  indicator: Indicator;
  onUpdate: (id: string, patch: Partial<Indicator>) => void;
}) {
  return (
    <div className="panel rounded-xl p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Editar indicador
          </p>
          <h2 className="mt-2 text-2xl font-bold">{indicator.name}</h2>
          <p className="mt-1 text-sm text-slate-400">{indicator.category}</p>
        </div>
        <IndicatorStatusBadge status={indicator.status} />
      </div>

      <div className="space-y-4">
        <Field label="Descripción">
          <textarea
            className="min-h-24 w-full rounded-lg border border-slate-700/80 bg-slate-950/55 px-3 py-3 text-sm text-slate-100 outline-none transition focus:border-blue-400"
            value={indicator.description}
            onChange={(event) =>
              onUpdate(indicator.id, { description: event.target.value })
            }
          />
        </Field>
        <Field label="Bots que lo usan">
          <input
            className="field w-full"
            value={indicator.usedBy.join(", ")}
            onChange={(event) =>
              onUpdate(indicator.id, {
                usedBy: event.target.value
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean)
              })
            }
          />
        </Field>
      </div>

      <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <BotMiniStat label="Salida" value={indicator.output} />
        <BotMiniStat label="Timeframe" value={indicator.timeframe} />
      </div>

      <div className="mt-5 flex items-center gap-2 rounded-lg border border-blue-400/35 bg-blue-500/10 px-3 py-3 text-sm text-blue-100">
        <Eye className="h-4 w-4" />
        Edita campos en la card y ajusta el código fuente en el editor inferior.
      </div>
    </div>
  );
}

function IndicatorStatusBadge({ status }: { status: Indicator["status"] }) {
  const styles = {
    Activo: "border-emerald-400/40 bg-emerald-500/12 text-emerald-300",
    Experimental: "border-violet-400/40 bg-violet-500/12 text-violet-200",
    Archivado: "border-slate-500/40 bg-slate-700/25 text-slate-300"
  };

  return (
    <span
      className={classNames(
        "rounded-full border px-3 py-1 text-xs font-semibold",
        styles[status]
      )}
    >
      {status}
    </span>
  );
}

function MetricPanel({
  icon: Icon,
  label,
  value,
  detail
}: {
  icon: typeof Bot;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="panel rounded-xl p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-bold">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{detail}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-blue-400/40 bg-blue-500/10 text-blue-200">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

function BotStrategyCard({
  bot,
  selected,
  onSelect
}: {
  bot: StrategyBot;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      className={classNames(
        "panel group min-h-64 rounded-xl p-5 text-left transition hover:-translate-y-0.5 hover:border-blue-400/60",
        selected && "border-blue-400/70 bg-blue-500/10"
      )}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={classNames(
              "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-black uppercase text-slate-950 shadow-glow",
              bot.accent
            )}
          >
            {bot.name.slice(0, 2)}
          </div>
          <div>
            <h3 className="text-lg font-bold">{bot.name}</h3>
            <p className="mt-1 text-sm text-slate-400">{bot.strategy}</p>
          </div>
        </div>
        <StatusBadge status={bot.status} />
      </div>

      <p className="mt-5 min-h-12 text-sm leading-6 text-slate-300">
        {bot.description}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <BotMiniStat label="Mercado" value={bot.market} />
        <BotMiniStat label="Timeframe" value={bot.timeframe} />
        <BotMiniStat label="Riesgo" value={bot.risk} />
        <BotMiniStat label="PnL" value={bot.pnl} positive={bot.pnl.startsWith("+")} />
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-700/60 pt-4 text-sm">
        <span className="flex items-center gap-2 text-slate-400">
          <Code2 className="h-4 w-4" />
          Ver código
        </span>
        <span className="text-slate-500">{bot.trades} operaciones</span>
      </div>
    </button>
  );
}

function StatusBadge({ status }: { status: StrategyBot["status"] }) {
  const styles = {
    Activo: "border-emerald-400/40 bg-emerald-500/12 text-emerald-300",
    Pausado: "border-amber-400/40 bg-amber-500/12 text-amber-300",
    Detenido: "border-slate-500/40 bg-slate-700/25 text-slate-300"
  };

  return (
    <span
      className={classNames(
        "rounded-full border px-3 py-1 text-xs font-semibold",
        styles[status]
      )}
    >
      {status}
    </span>
  );
}

function BotMiniStat({
  label,
  value,
  positive
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-lg border border-slate-700/70 bg-slate-950/35 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p
        className={classNames(
          "mt-1 font-semibold",
          positive ? "text-emerald-300" : "text-slate-100"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function Field({
  label,
  children,
  className
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={classNames("block", className)}>
      <span className="mb-2 block text-sm text-slate-300">{label}</span>
      {children}
    </label>
  );
}

function Select({
  value,
  onChange,
  children
}: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <span className="relative block">
      <select
        className="field w-full appearance-none pr-9"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </span>
  );
}

function Segmented({
  value,
  options,
  onChange
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid overflow-hidden rounded-lg border border-slate-700/80 sm:grid-cols-3">
      {options.map((option) => (
        <button
          key={option}
          className={classNames(
            "border-b border-slate-700/80 px-3 py-3 text-sm last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0",
            value === option
              ? "bg-emerald-500/16 text-emerald-300"
              : "bg-slate-950/35 text-slate-300 hover:bg-slate-800/50"
          )}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function SliderField({
  label,
  value,
  onChange
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="mb-4">
      <div className="mb-3 flex items-center justify-between gap-4">
        <label className="text-sm text-slate-300">{label}</label>
        <NumberWithUnit value={value} unit="%" onChange={onChange} />
      </div>
      <input
        className="h-2 w-full cursor-pointer"
        min="0.1"
        max="5"
        step="0.1"
        type="range"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <div className="mt-1 flex justify-between text-xs text-slate-400">
        <span>0.1%</span>
        <span>5%</span>
      </div>
    </div>
  );
}

function NumberWithUnit({
  value,
  unit,
  onChange
}: {
  value: number;
  unit: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="field flex w-28 items-center gap-2">
      <input
        className="w-full bg-transparent text-right outline-none"
        min="0"
        step="0.1"
        type="number"
        value={value.toFixed(2)}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <span className="text-slate-400">{unit}</span>
    </div>
  );
}

function Toggle({
  checked,
  onChange
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      aria-pressed={checked}
      className={classNames(
        "relative h-6 w-11 shrink-0 rounded-full transition",
        checked ? "bg-emerald-400" : "bg-slate-600"
      )}
      onClick={() => onChange(!checked)}
    >
      <span
        className={classNames(
          "absolute top-1 h-4 w-4 rounded-full bg-white transition",
          checked ? "left-6" : "left-1"
        )}
      />
    </button>
  );
}

function ConditionRow({
  label,
  left,
  middle,
  right
}: {
  label: string;
  left: string;
  middle: string;
  right?: string;
}) {
  return (
    <div className="mb-3 grid items-center gap-2 sm:grid-cols-[90px_1fr_1fr_64px]">
      <span className="text-xs text-slate-400">{label}</span>
      <Select value={left} onChange={() => undefined}>
        <option>{left}</option>
      </Select>
      <Select value={middle} onChange={() => undefined}>
        <option>{middle}</option>
      </Select>
      {right ? (
        <input className="field w-full" value={right} onChange={() => undefined} />
      ) : (
        <span className="hidden sm:block" />
      )}
    </div>
  );
}

function SafetyValue({ itemKey }: { itemKey: SafetyKey }) {
  const values: Record<SafetyKey, React.ReactNode> = {
    spread: <span>0.10&nbsp;%</span>,
    atr: <span>2.00&nbsp;%</span>,
    news: <span>30&nbsp;min</span>,
    lossStreak: null,
    dailyLoss: <span>3.00&nbsp;%</span>,
    weeklyLoss: <span>10.00&nbsp;%</span>,
    session: <span>Londres / Nueva York</span>,
    liquidity: <span>1M USDT</span>
  };
  const value = values[itemKey];
  if (!value) return null;
  return (
    <span className="rounded-md border border-slate-700/75 bg-slate-950/45 px-3 py-2 text-xs text-slate-200">
      {value}
    </span>
  );
}

function SessionRow({
  active,
  label,
  time,
  onChange
}: {
  active: boolean;
  label: string;
  time: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-4">
      <Toggle checked={active} onChange={onChange} />
      <span className="flex-1 text-sm text-slate-300">{label}</span>
      <span className={classNames("text-sm", active ? "text-slate-100" : "text-slate-500")}>
        {time}
      </span>
    </div>
  );
}

function TimelineBlock({
  active,
  left,
  width,
  color
}: {
  active: boolean;
  left: string;
  width: string;
  color: string;
}) {
  if (!active) return null;
  return (
    <span
      className={classNames("absolute top-4 h-4 rounded-sm opacity-80", color)}
      style={{ left, width }}
    />
  );
}

function Progress({
  label,
  value,
  max,
  suffix
}: {
  label: string;
  value: number;
  max: number;
  suffix: string;
}) {
  const percentage = Math.min((value / max) * 100, 100);
  return (
    <div className="mb-5 last:mb-0">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="font-medium text-slate-100">
          {value.toFixed(2)}
          {suffix}
        </span>
      </div>
      <div className="h-3 rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.34)]"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default App;
