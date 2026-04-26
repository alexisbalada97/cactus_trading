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
  Gauge,
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
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
  Zap
} from "lucide-react";
import { useMemo, useState } from "react";

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
  { label: "Panel de Control", icon: LayoutDashboard },
  { label: "Operaciones", icon: ClipboardList },
  { label: "Señales", icon: Radio },
  { label: "Backtesting", icon: RotateCcw },
  { label: "Rendimiento", icon: BarChart3 },
  { label: "Logs", icon: ListChecks },
  { label: "Alertas", icon: Bell },
  { label: "Conexiones", icon: Network }
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

function App() {
  const [botStatus, setBotStatus] = useState<"Detenido" | "Activo">("Detenido");
  const [toast, setToast] = useState("");
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

  const saveConfig = () => {
    setToast("Configuración guardada");
    window.setTimeout(() => setToast(""), 2200);
  };

  return (
    <div className="min-h-screen text-slate-100">
      <div className="flex min-h-screen">
        <Sidebar
          botStatus={botStatus}
          onStart={() => setBotStatus("Activo")}
          onEmergency={() => setBotStatus("Detenido")}
        />

        <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
          <Header onSave={saveConfig} />

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
  botStatus,
  onStart,
  onEmergency
}: {
  botStatus: "Detenido" | "Activo";
  onStart: () => void;
  onEmergency: () => void;
}) {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-700/70 bg-slate-950/72 backdrop-blur-xl lg:flex lg:flex-col">
      <div className="flex h-20 items-center gap-3 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/50 bg-blue-500/12 text-blue-200">
          <Bot className="h-6 w-6" />
        </div>
        <span className="text-2xl font-bold tracking-tight">TradeBot</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.label === "Configuración";
          return (
            <button
              className={classNames(
                "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm transition",
                active
                  ? "bg-blue-600/22 text-blue-200"
                  : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
              )}
              key={item.label}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="px-4 pb-6">
        <div className="rounded-xl border border-slate-700/80 bg-slate-900/70 p-4">
          <p className="text-xs text-slate-400">Cuenta conectada</p>
          <div className="mt-2 flex items-center gap-2 font-semibold">
            <CircleDollarSign className="h-5 w-5 text-amber-300" />
            Binance
          </div>
          <div className="my-4 h-px bg-slate-700/60" />
          <p className="text-xs text-slate-400">Estado del bot</p>
          <div className="mt-2 flex items-center gap-2 font-semibold">
            <span
              className={classNames(
                "h-3 w-3 rounded-full",
                botStatus === "Activo" ? "bg-emerald-400" : "bg-slate-500"
              )}
            />
            {botStatus}
          </div>
          <div className="my-4 h-px bg-slate-700/60" />
          <button
            className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-400/80 bg-emerald-500/10 px-4 py-3 font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
            onClick={onStart}
          >
            <Power className="h-4 w-4" />
            Iniciar Bot
          </button>
          <button
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-rose-500/80 bg-rose-500/10 px-4 py-3 font-semibold text-rose-300 transition hover:bg-rose-500/20"
            onClick={onEmergency}
          >
            <AlertTriangle className="h-4 w-4" />
            Parada de emergencia
          </button>
        </div>
      </div>
    </aside>
  );
}

function Header({ onSave }: { onSave: () => void }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-700/70 bg-slate-950/70 backdrop-blur-xl">
      <div className="flex min-h-20 flex-col gap-4 px-4 py-4 sm:px-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <button className="icon-button lg:hidden" aria-label="Abrir menú">
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Configuración del Bot
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Personaliza los parámetros de operación
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex h-11 overflow-hidden rounded-lg border border-slate-700/80 bg-slate-950/45">
            <span className="flex items-center border-r border-slate-700/80 px-3 text-sm text-slate-400">
              Plantillas
            </span>
            <select className="field h-full min-w-48 border-0 bg-transparent" defaultValue="Swing BTC 15m">
              <option>Swing BTC 15m</option>
              <option>Scalping NASDAQ M1</option>
              <option>Crypto Intradía</option>
            </select>
          </label>
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
    <aside className="space-y-5 xl:sticky xl:top-28 xl:self-start">
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
