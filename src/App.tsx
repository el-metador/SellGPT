import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type MouseEvent,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "./supabaseClient";

export type Variant = "base" | "sales";
export type Page = "home" | "account" | "terms" | "privacy";

type LeadStatus = "new" | "in_progress" | "done";

type Lead = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  telegram: string | null;
  seats: number;
  company: string | null;
  goal: string | null;
  status: LeadStatus;
  notes: string | null;
};

type Profile = {
  id: string;
  role: string | null;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
};

type StatItem = {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
};

type LegalSection = {
  title: string;
  body: string;
};

const DATE_FORMATTER = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "medium",
  timeStyle: "short",
});

const TERMINAL_LINES = [
  "$ codex plan \"Подключить команду\"",
  "→ находит зависимости и риски",
  "→ предлагает задачи по внедрению",
  "",
  "$ codex review",
  "→ проверяет качество кода",
  "→ отмечает тесты",
  "",
  "$ codex test --changed",
  "→ запускает нужные проверки",
  "→ подтверждает релиз",
];

const LIVE_LINES = [
  "codex@workspace:~$ scan repo",
  "✔ контекст загружен",
  "codex@workspace:~$ analyze onboarding",
  "→ найдено 2 узких места",
  "→ предложено 3 ускорения",
  "codex@workspace:~$ generate patch",
  "✔ 4 файла обновлены",
  "→ все тесты прошли",
];

const STAT_ITEMS: StatItem[] = [
  { value: 10, suffix: "мин", label: "на оформление заявки" },
  { value: 3, suffix: "шага", label: "до подключения" },
  { value: 24, suffix: "/7", label: "приём заявок" },
  { value: 20, prefix: "$", label: "за месяц доступа" },
];

const BADGES = [
  "Google OAuth для входа",
  "Supabase backend + RLS",
  "Статусы и SLA по заявкам",
  "Личный кабинет администратора",
  "Безопасные роли команд",
  "Поддержка внедрения",
];

const BENEFITS = [
  {
    title: "Рабочие пространства Business",
    text:
      "Разделяйте команды, проекты и доступы — всё в единой рабочей среде с контролем ролей.",
  },
  {
    title: "Защита данных",
    text: "Данные Business изолированы, доступы централизованы, политики задаются администратором.",
  },
  {
    title: "Codex для разработки",
    text: "Делегируйте обзоры, патчи и тесты, чтобы ускорять выпуск фич и релизов.",
  },
  {
    title: "Интеграции и знания",
    text: "Подключайте файлы, внутренние базы знаний и приложения для командных задач.",
  },
  {
    title: "Командная аналитика",
    text: "Следите за активностью, распределением задач и загрузкой команд в едином окне.",
  },
  {
    title: "Быстрый onboarding",
    text: "Готовые сценарии внедрения и помощь с настройкой процессов под вашу команду.",
  },
];

const FEATURE_PILLS = [
  "Projects",
  "Tasks",
  "Vision",
  "Voice",
  "Codex",
  "Shared workspaces",
  "Admin roles",
  "Apps & tools",
  "Data governance",
  "Usage analytics",
];

const STACK_ITEMS = [
  {
    title: "Supabase backend",
    text: "Postgres-ядро с RLS, таблицами заявок и готовыми SQL-миграциями.",
  },
  {
    title: "Google регистрация",
    text: "OAuth вход для админов и владельцев заявок без паролей и лишних форм.",
  },
  {
    title: "Личный кабинет",
    text: "Списки заявок, статусы, заметки и контроль в одном интерфейсе.",
  },
  {
    title: "Гибкие статусы",
    text: "Новая → В работе → Закрыта с быстрым обновлением через интерфейс.",
  },
];

const PROCESS_STEPS = [
  {
    title: "Заявка",
    text: "Заполняете форму и описываете задачу команды.",
  },
  {
    title: "Согласование",
    text: "Подбираем количество мест, сроки и доступы.",
  },
  {
    title: "Подключение",
    text: "Создаём рабочее пространство Business и выдаём роли.",
  },
  {
    title: "Сопровождение",
    text: "Помогаем встроить инструменты в процессы команды.",
  },
];

const TERMS_CONTENT: LegalSection[] = [
  {
    title: "Использование сервиса",
    body:
      "SellGPT предоставляет информацию и сопровождение по подключению ChatGPT Business. Пользователь соглашается использовать сервис в рамках действующих правил и ограничений OpenAI.",
  },
  {
    title: "Регистрация и доступ",
    body:
      "Для доступа к личному кабинету используется Google OAuth. Ответственность за безопасность учётной записи лежит на пользователе.",
  },
  {
    title: "Оформление заявок",
    body:
      "Заявки фиксируются в системе и используются для связи и подготовки коммерческого предложения. Мы можем связаться по указанным контактам для уточнения деталей.",
  },
  {
    title: "Ограничение ответственности",
    body:
      "SellGPT не гарантирует наличие мест или сроков подключения, так как они зависят от условий поставщика. Информация предоставляется как есть.",
  },
];

const PRIVACY_CONTENT: LegalSection[] = [
  {
    title: "Какие данные мы собираем",
    body:
      "Имя, email, Telegram (если указан), компания, цели и количество мест. Также фиксируется статус заявки и служебные заметки.",
  },
  {
    title: "Зачем мы используем данные",
    body:
      "Данные используются для обработки заявки, коммуникации, подготовки подключения и внутренней аналитики.",
  },
  {
    title: "Хранение и безопасность",
    body:
      "Данные хранятся в Supabase Postgres с RLS-политиками. Доступ ограничен администраторами с ролью admin.",
  },
  {
    title: "Обновление данных",
    body:
      "Вы можете запросить обновление или удаление данных, написав в поддержку. Мы обработаем запрос в разумные сроки.",
  },
];

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "Новая",
  in_progress: "В работе",
  done: "Закрыта",
};

const VARIANT_COPY = {
  base: {
    pageTitle: "SellGPT — подключение ChatGPT Business",
    pill: "Запуск и сопровождение для команд",
    heroTitle: "SellGPT: подключение ChatGPT Business через заявку",
    heroSubtitle:
      "Официальные возможности Business: мощные модели, рабочие пространства, Codex и контроль доступа. Оставьте заявку — и получите план подключения под вашу команду.",
    primaryCta: "Оставить заявку",
    secondaryCta: "Посмотреть возможности",
    heroNote: "Функции и лимиты зависят от условий OpenAI и выбранного тарифа.",
    benefitsTitle: "Ключевые преимущества Business",
    stackTitle: "Технологический контур",
    processTitle: "Как проходит подключение",
    formTitle: "Быстрая заявка",
    formHint: "Заполните данные — мы свяжемся и предложим оптимальный вариант.",
  },
  sales: {
    pageTitle: "SellGPT — быстрый старт для команды",
    pill: "Ограниченное количество подключений",
    heroTitle: "SellGPT: быстрый запуск ChatGPT Business для команды",
    heroSubtitle:
      "Получите Business-функции с поддержкой внедрения, ролями и личным кабинетом заявок. Оставьте заявку — и мы подтвердим доступность.",
    primaryCta: "Забронировать подключение",
    secondaryCta: "Смотреть детали",
    heroNote: "Функции и лимиты зависят от условий OpenAI и выбранного тарифа.",
    benefitsTitle: "Почему это удобно для команды",
    stackTitle: "Stack для заявок и администрирования",
    processTitle: "Путь от заявки до запуска",
    formTitle: "Заявка на подключение",
    formHint: "Опишите команду и сроки — мы ответим с планом запуска.",
  },
} as const;

function useTypingEffect(lines: string[], speed: number, resetDelay: number) {
  const [text, setText] = useState("");
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    let lineIndex = 0;
    let charIndex = 0;

    const tick = () => {
      if (lineIndex >= lines.length) {
        timeoutRef.current = window.setTimeout(() => {
          setText("");
          lineIndex = 0;
          charIndex = 0;
          tick();
        }, resetDelay);
        return;
      }

      const line = lines[lineIndex] ?? "";
      setText((prev) => prev + line.charAt(charIndex));
      charIndex += 1;

      if (charIndex >= line.length) {
        setText((prev) => prev + "\n");
        lineIndex += 1;
        charIndex = 0;
        timeoutRef.current = window.setTimeout(tick, speed * 6);
        return;
      }

      timeoutRef.current = window.setTimeout(tick, speed);
    };

    tick();

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [lines, resetDelay, speed]);

  return text;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mediaQuery.matches);
    update();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", update);
      return () => mediaQuery.removeEventListener("change", update);
    }

    mediaQuery.addListener(update);
    return () => mediaQuery.removeListener(update);
  }, []);

  return reduced;
}

function useInView<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, isInView };
}

function useCountUp(target: number, enabled: boolean, duration = 1200) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      setValue(Math.round(progress * target));
      if (progress < 1) {
        raf = window.requestAnimationFrame(tick);
      }
    };

    raf = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(raf);
  }, [duration, enabled, target]);

  return value;
}

function Terminal({ text }: { text: string }) {
  return (
    <div className="terminal">
      <div className="terminal-header">
        <span className="terminal-dot"></span>
        <span className="terminal-dot"></span>
        <span className="terminal-dot"></span>
      </div>
      <div className="terminal-body">{text}</div>
      <span className="caret"></span>
    </div>
  );
}

function StatCard({ item, delay, reducedMotion }: { item: StatItem; delay: number; reducedMotion: boolean }) {
  const { ref, isInView } = useInView<HTMLDivElement>();
  const value = useCountUp(item.value, isInView && !reducedMotion);
  const displayValue = reducedMotion ? item.value : value;

  return (
    <div ref={ref} className="stat-card reveal" data-reveal style={{ transitionDelay: `${delay}ms` }}>
      <div className="stat-value">
        {item.prefix}
        {displayValue}
        {item.suffix}
      </div>
      <div className="stat-label">{item.label}</div>
    </div>
  );
}

function LeadCard({
  lead,
  onUpdate,
  onDelete,
  isSelected,
  onSelect,
  selectable = false,
}: {
  lead: Lead;
  onUpdate: (id: string, updates: Partial<Lead>) => Promise<boolean>;
  onDelete?: (id: string) => Promise<boolean>;
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  selectable?: boolean;
}) {
  const [note, setNote] = useState(lead.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setNote(lead.notes ?? "");
  }, [lead.notes]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    await onUpdate(lead.id, { notes: note });
    setSaving(false);
  }, [lead.id, note, onUpdate]);

  const handleStatusChange = useCallback(
    async (event: ChangeEvent<HTMLSelectElement>) => {
      const status = event.target.value as LeadStatus;
      setSaving(true);
      await onUpdate(lead.id, { status });
      setSaving(false);
    },
    [lead.id, onUpdate]
  );

  const handleDelete = useCallback(async () => {
    if (!onDelete) return;
    if (!window.confirm("Удалить эту заявку? Действие нельзя отменить.")) return;
    setDeleting(true);
    await onDelete(lead.id);
    setDeleting(false);
  }, [lead.id, onDelete]);

  const handleSelect = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onSelect?.(lead.id, event.target.checked);
    },
    [lead.id, onSelect]
  );

  return (
    <div className={`lead-card ${isSelected ? "selected" : ""}`}>
      {selectable && (
        <div className="lead-select-row">
          <input
            type="checkbox"
            className="lead-checkbox"
            checked={isSelected}
            onChange={handleSelect}
          />
          <span className="lead-meta">Выбрать</span>
        </div>
      )}
      <div className="lead-header">
        <div>
          <div className="lead-name">{lead.name}</div>
          <div className="lead-meta">{lead.email}</div>
          {lead.telegram ? <div className="lead-meta">Telegram: {lead.telegram}</div> : null}
        </div>
        <span className={`status-pill status-${lead.status}`}>{STATUS_LABELS[lead.status]}</span>
      </div>
      <div className="lead-body">
        <div>Мест: {lead.seats}</div>
        {lead.company ? <div>Компания: {lead.company}</div> : null}
        {lead.goal ? <div>Задачи: {lead.goal}</div> : null}
        <div className="lead-meta">{DATE_FORMATTER.format(new Date(lead.created_at))}</div>
      </div>
      <div className="lead-actions">
        <label className="select-field">
          Статус
          <select value={lead.status} onChange={handleStatusChange} disabled={saving || deleting}>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="select-field">
          Заметка
          <textarea
            rows={3}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Комментарий по заявке"
            disabled={saving || deleting}
          ></textarea>
        </label>
        <div className="lead-mobile-actions">
          <button className="ghost" type="button" onClick={handleSave} disabled={saving || deleting}>
            {saving ? "Сохраняем..." : "Сохранить"}
          </button>
          {onDelete && (
            <button
              className="lead-delete-btn"
              type="button"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Удаление..." : "Удалить"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminStats({ leads }: { leads: Lead[] }) {
  const stats = useMemo(() => {
    const total = leads.length;
    const new_ = leads.filter((l) => l.status === "new").length;
    const inProgress = leads.filter((l) => l.status === "in_progress").length;
    const done = leads.filter((l) => l.status === "done").length;
    return { total, new: new_, inProgress, done };
  }, [leads]);

  return (
    <div className="admin-stats-grid">
      <div className="admin-stat-card">
        <div className="admin-stat-value">{stats.total}</div>
        <div className="admin-stat-label">Всего заявок</div>
      </div>
      <div className="admin-stat-card">
        <div className="admin-stat-value new">{stats.new}</div>
        <div className="admin-stat-label">Новые</div>
      </div>
      <div className="admin-stat-card">
        <div className="admin-stat-value in_progress">{stats.inProgress}</div>
        <div className="admin-stat-label">В работе</div>
      </div>
      <div className="admin-stat-card">
        <div className="admin-stat-value done">{stats.done}</div>
        <div className="admin-stat-label">Закрыты</div>
      </div>
    </div>
  );
}

function exportLeadsToCSV(leads: Lead[]) {
  const headers = ["ID", "Дата", "Имя", "Email", "Telegram", "Мест", "Компания", "Задачи", "Статус", "Заметки"];
  const rows = leads.map((lead) => [
    lead.id,
    new Date(lead.created_at).toISOString(),
    lead.name,
    lead.email,
    lead.telegram || "",
    lead.seats,
    lead.company || "",
    lead.goal || "",
    STATUS_LABELS[lead.status],
    lead.notes || "",
  ]);

  const csv = [headers.join(";"), ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";"))].join("\n");

  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `leads_${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function LegalPage({ title, description, sections }: { title: string; description: string; sections: LegalSection[] }) {
  return (
    <section className="section legal">
      <div className="section-head">
        <span className="section-kicker">SellGPT</span>
        <h2>{title}</h2>
        <p className="section-subtitle">{description}</p>
      </div>
      <div className="legal-grid">
        {sections.map((section) => (
          <div key={section.title} className="legal-card reveal" data-reveal>
            <h3>{section.title}</h3>
            <p>{section.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function App({ variant, page }: { variant: Variant; page: Page }) {
  const copy = VARIANT_COPY[variant];
  const reducedMotion = usePrefersReducedMotion();
  const pageRef = useRef<HTMLDivElement | null>(null);
  const heroPanelRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);

  const terminalText = useTypingEffect(TERMINAL_LINES, 28, 1800);
  const liveText = useTypingEffect(LIVE_LINES, 24, 1800);

  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadsError, setLeadsError] = useState<string | null>(null);
  const [formStatus, setFormStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const isHome = page === "home";
  const isAccount = page === "account";
  const isAdmin = profile?.role === "admin";

  const pageTitle = useMemo(() => {
    switch (page) {
      case "account":
        return "SellGPT — личный кабинет";
      case "terms":
        return "SellGPT — условия использования";
      case "privacy":
        return "SellGPT — конфиденциальность";
      default:
        return copy.pageTitle;
    }
  }, [copy.pageTitle, page]);

  useEffect(() => {
    document.title = pageTitle;
  }, [pageTitle]);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || menuButtonRef.current?.contains(target)) return;
      setMenuOpen(false);
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [menuOpen]);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!elements.length) return;

    if (reducedMotion) {
      elements.forEach((element) => element.classList.add("visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;

    const root = document.documentElement;
    let scrollRaf = 0;
    let pointerRaf = 0;
    const pointer = { x: 0.5, y: 0.5 };

    const handleScroll = () => {
      if (scrollRaf) return;
      scrollRaf = window.requestAnimationFrame(() => {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
        root.style.setProperty("--scroll-progress", progress.toFixed(3));
        scrollRaf = 0;
      });
    };

    const handlePointer = (event: PointerEvent) => {
      pointer.x = event.clientX / window.innerWidth;
      pointer.y = event.clientY / window.innerHeight;

      if (pointerRaf) return;
      pointerRaf = window.requestAnimationFrame(() => {
        const x = pointer.x * 2 - 1;
        const y = pointer.y * 2 - 1;
        pageRef.current?.style.setProperty("--mouse-x", x.toFixed(3));
        pageRef.current?.style.setProperty("--mouse-y", y.toFixed(3));
        pointerRaf = 0;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("pointermove", handlePointer, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pointermove", handlePointer);
      if (scrollRaf) window.cancelAnimationFrame(scrollRaf);
      if (pointerRaf) window.cancelAnimationFrame(pointerRaf);
    };
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion || !isHome) return;
    const element = heroPanelRef.current;
    if (!element) return;

    let raf = 0;

    const handleMove = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        element.style.setProperty("--tilt-x", `${(-y * 6).toFixed(2)}deg`);
        element.style.setProperty("--tilt-y", `${(x * 8).toFixed(2)}deg`);
        raf = 0;
      });
    };

    const handleLeave = () => {
      element.style.setProperty("--tilt-x", "0deg");
      element.style.setProperty("--tilt-y", "0deg");
    };

    element.addEventListener("pointermove", handleMove);
    element.addEventListener("pointerleave", handleLeave);

    return () => {
      element.removeEventListener("pointermove", handleMove);
      element.removeEventListener("pointerleave", handleLeave);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [isHome, reducedMotion]);

  useEffect(() => {
    if (!supabase) return;

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setSession(data.session);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!supabase || !session?.user) {
      setProfile(null);
      return;
    }

    let active = true;

    const loadProfile = async () => {
      setAuthError(null);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, role, full_name, email, avatar_url")
        .eq("id", session.user.id)
        .maybeSingle();

      if (!active) return;

      if (error) {
        setAuthError(error.message);
        return;
      }

      if (!data) {
        const insertPayload = {
          id: session.user.id,
          email: session.user.email,
          full_name:
            session.user.user_metadata?.full_name ??
            session.user.user_metadata?.name ??
            null,
          avatar_url: session.user.user_metadata?.avatar_url ?? null,
        };

        const { error: insertError } = await supabase.from("profiles").insert(insertPayload);
        if (insertError) {
          setAuthError(insertError.message);
          return;
        }

        setProfile({
          id: insertPayload.id,
          email: insertPayload.email ?? null,
          full_name: insertPayload.full_name,
          avatar_url: insertPayload.avatar_url,
          role: "user",
        });
        return;
      }

      setProfile(data);
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, [session]);

  useEffect(() => {
    if (!supabase || !isAdmin || !isAccount) {
      setLeads([]);
      setLeadsLoading(false);
      setLeadsError(null);
      return;
    }

    let active = true;

    const loadLeads = async () => {
      setLeadsLoading(true);
      setLeadsError(null);

      const { data, error } = await supabase
        .from("leads")
        .select("id, created_at, name, email, telegram, seats, company, goal, status, notes")
        .order("created_at", { ascending: false })
        .limit(200);

      if (!active) return;

      if (error) {
        setLeadsError(error.message);
        setLeadsLoading(false);
        return;
      }

      setLeads(data ?? []);
      setLeadsLoading(false);
    };

    loadLeads();

    return () => {
      active = false;
    };
  }, [isAccount, isAdmin]);

  const handleGoogleSignIn = useCallback(async () => {
    if (!supabase) return;
    setAuthError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.href },
    });

    if (error) {
      setAuthError(error.message);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) {
      setAuthError(error.message);
    }
  }, []);

  const handleLeadSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setFormError(null);

      if (!supabase) {
        setFormStatus("error");
        setFormError("Supabase не настроен. Добавьте ключи в .env.");
        return;
      }

      setFormStatus("sending");

      const form = event.currentTarget;
      const data = new FormData(form);

      const name = data.get("name")?.toString().trim();
      const email = data.get("email")?.toString().trim();
      const telegram = data.get("telegram")?.toString().trim();
      const seats = Number(data.get("seats")?.toString() ?? 1);
      const company = data.get("company")?.toString().trim();
      const goal = data.get("goal")?.toString().trim();

      const payload = {
        name: name || "",
        email: email || "",
        telegram: telegram || null,
        seats: Number.isFinite(seats) ? seats : 1,
        company: company || null,
        goal: goal || null,
        status: "new",
        source: variant,
      };

      const { error } = await supabase.from("leads").insert(payload);

      if (error) {
        setFormStatus("error");
        setFormError(error.message);
        return;
      }

      form.reset();
      setFormStatus("success");
    },
    [variant]
  );

  const handleLeadUpdate = useCallback(async (id: string, updates: Partial<Lead>) => {
    if (!supabase) return false;
    const { error } = await supabase.from("leads").update(updates).eq("id", id);
    if (error) {
      setLeadsError(error.message);
      return false;
    }

    setLeads((prev) => prev.map((lead) => (lead.id === id ? { ...lead, ...updates } : lead)));
    return true;
  }, []);

  const handleLeadDelete = useCallback(async (id: string) => {
    if (!supabase) return false;
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) {
      setLeadsError(error.message);
      return false;
    }

    setLeads((prev) => prev.filter((lead) => lead.id !== id));
    setSelectedLeads((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    return true;
  }, []);

  const handleBulkDelete = useCallback(async () => {
    if (!supabase || selectedLeads.size === 0) return;
    if (!window.confirm(`Удалить ${selectedLeads.size} заявок? Действие нельзя отменить.`)) return;

    const ids = Array.from(selectedLeads);
    const { error } = await supabase.from("leads").delete().in("id", ids);

    if (error) {
      setLeadsError(error.message);
      return;
    }

    setLeads((prev) => prev.filter((lead) => !selectedLeads.has(lead.id)));
    setSelectedLeads(new Set());
  }, [selectedLeads]);

  const handleSelectLead = useCallback((id: string, selected: boolean) => {
    setSelectedLeads((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback((selected: boolean) => {
    if (selected) {
      setSelectedLeads(new Set(filteredLeads.map((l) => l.id)));
    } else {
      setSelectedLeads(new Set());
    }
  }, []);

  const filteredLeads = useMemo(() => {
    let result = leads;
    if (statusFilter !== "all") {
      result = result.filter((lead) => lead.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (lead) =>
          lead.name.toLowerCase().includes(query) ||
          lead.email.toLowerCase().includes(query) ||
          lead.telegram?.toLowerCase().includes(query) ||
          lead.company?.toLowerCase().includes(query)
      );
    }
    return result;
  }, [leads, statusFilter, searchQuery]);

  return (
    <div className="page" ref={pageRef}>
      <div className="progress-bar"></div>
      <div className="bg-grid" aria-hidden="true"></div>
      <div className="bg-orb" style={{ top: "-120px", left: "-120px" }}></div>
      <div className="bg-orb orb-2" style={{ top: "160px", right: "-160px" }}></div>
      <div className="bg-orb orb-3" style={{ bottom: "-160px", left: "10%" }}></div>

      {/* Mobile Navigation Overlay */}
      <div
        className={`mobile-menu-overlay ${mobileNavOpen ? "open" : ""}`}
        onClick={() => setMobileNavOpen(false)}
      />
      <div className={`mobile-nav ${mobileNavOpen ? "open" : ""}`}>
        <div className="mobile-nav-header">
          <div className="brand">
            <div className="brand-badge"></div>
            <span>SellGPT</span>
          </div>
          <button className="mobile-nav-close" onClick={() => setMobileNavOpen(false)}>
            ✕
          </button>
        </div>
        <div className="mobile-nav-links">
          {isHome ? (
            <>
              <a href="#benefits" onClick={() => setMobileNavOpen(false)}>Преимущества</a>
              <a href="#stack" onClick={() => setMobileNavOpen(false)}>Stack</a>
              <a href="#codex" onClick={() => setMobileNavOpen(false)}>Codex</a>
              <a href="#process" onClick={() => setMobileNavOpen(false)}>Процесс</a>
              <a href="#lead-form" onClick={() => setMobileNavOpen(false)}>Заявка</a>
            </>
          ) : (
            <>
              <a href="/index.html" onClick={() => setMobileNavOpen(false)}>Главная</a>
              <a href="/dashboard.html" onClick={() => setMobileNavOpen(false)}>Личный кабинет</a>
              <a href="/terms.html" onClick={() => setMobileNavOpen(false)}>Условия использования</a>
              <a href="/privacy.html" onClick={() => setMobileNavOpen(false)}>Конфиденциальность</a>
            </>
          )}
        </div>
        <div className="mobile-nav-section">
          <div className="mobile-nav-title">Аккаунт</div>
          {!isSupabaseConfigured ? (
            <div className="menu-note">Supabase не подключён</div>
          ) : session ? (
            <div className="menu-user">
              <div className="auth-chip">
                {profile?.avatar_url ? (
                  <img className="avatar" src={profile.avatar_url} alt="" />
                ) : (
                  <div className="avatar-fallback">{(profile?.full_name || "U").slice(0, 1)}</div>
                )}
                <span>{profile?.full_name || session.user.email}</span>
              </div>
              <button className="ghost" type="button" onClick={handleSignOut}>
                Выйти
              </button>
            </div>
          ) : (
            <button className="ghost" type="button" onClick={handleGoogleSignIn}>
              Войти через Google
            </button>
          )}
        </div>
      </div>

      <nav className="nav">
        <div className="brand">
          <div className="brand-badge"></div>
          <span>SellGPT</span>
        </div>
        <div className="nav-links">
          {isHome ? (
            <>
              <a href="#benefits">Преимущества</a>
              <a href="#stack">Stack</a>
              <a href="#codex">Codex</a>
              <a href="#process">Процесс</a>
              <a href="#lead-form">Заявка</a>
            </>
          ) : (
            <>
              <a href="/index.html">Главная</a>
              <a href="/dashboard.html">Личный кабинет</a>
              <a href="/terms.html">Условия</a>
              <a href="/privacy.html">Конфиденциальность</a>
            </>
          )}
        </div>
        <div className="nav-actions">
          {/* Mobile menu button */}
          <button
            className={`menu-button mobile-visible ${mobileNavOpen ? "open" : ""}`}
            type="button"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Открыть меню"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          
          {isHome ? (
            <a className="cta" href="#lead-form">
              {copy.primaryCta}
            </a>
          ) : (
            <a className="cta" href="/index.html#lead-form">
              Оставить заявку
            </a>
          )}
          <div className="menu" ref={menuRef}>
            <button
              ref={menuButtonRef}
              className={`menu-button ${menuOpen ? "open" : ""}`}
              type="button"
              aria-haspopup="true"
              aria-expanded={menuOpen}
              aria-controls="menu-panel"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
            {menuOpen ? (
              <div className="menu-panel" id="menu-panel" role="menu">
                <div className="menu-section">
                  <div className="menu-title">Навигация</div>
                  {isHome ? (
                    <>
                      <a href="#benefits" onClick={closeMenu} role="menuitem">
                        Преимущества
                      </a>
                      <a href="#stack" onClick={closeMenu} role="menuitem">
                        Stack
                      </a>
                      <a href="#codex" onClick={closeMenu} role="menuitem">
                        Codex
                      </a>
                      <a href="#process" onClick={closeMenu} role="menuitem">
                        Процесс
                      </a>
                      <a href="#lead-form" onClick={closeMenu} role="menuitem">
                        Заявка
                      </a>
                      <a href="/dashboard.html" onClick={closeMenu} role="menuitem">
                        Личный кабинет
                      </a>
                    </>
                  ) : (
                    <>
                      <a href="/index.html" onClick={closeMenu} role="menuitem">
                        Главная
                      </a>
                      <a href="/dashboard.html" onClick={closeMenu} role="menuitem">
                        Личный кабинет
                      </a>
                    </>
                  )}
                </div>
                <div className="menu-section">
                  <div className="menu-title">Аккаунт</div>
                  {!isSupabaseConfigured ? (
                    <div className="menu-note">Supabase не подключён</div>
                  ) : session ? (
                    <div className="menu-user">
                      <div className="auth-chip">
                        {profile?.avatar_url ? (
                          <img className="avatar" src={profile.avatar_url} alt="" />
                        ) : (
                          <div className="avatar-fallback">{(profile?.full_name || "U").slice(0, 1)}</div>
                        )}
                        <span>{profile?.full_name || session.user.email}</span>
                      </div>
                      <button className="ghost" type="button" onClick={handleSignOut}>
                        Выйти
                      </button>
                    </div>
                  ) : (
                    <button className="ghost" type="button" onClick={handleGoogleSignIn}>
                      Войти через Google
                    </button>
                  )}
                </div>
                <div className="menu-section">
                  <div className="menu-title">Документы</div>
                  <a href="/terms.html" onClick={closeMenu} role="menuitem">
                    Условия использования
                  </a>
                  <a href="/privacy.html" onClick={closeMenu} role="menuitem">
                    Конфиденциальность
                  </a>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </nav>

      {isHome ? (
        <>
          <header className="hero">
            <div className="hero-copy">
              <span className="pill">
                <span className="pulse"></span>
                {copy.pill}
              </span>
              <h1>{copy.heroTitle}</h1>
              <p>{copy.heroSubtitle}</p>
              <div className="hero-actions">
                <a className="cta" href="#lead-form">
                  {copy.primaryCta}
                </a>
                <a className="cta-secondary" href="#benefits">
                  {copy.secondaryCta}
                </a>
              </div>
              <div className="hero-note">{copy.heroNote}</div>
              <div className="stats-grid">
                {STAT_ITEMS.map((item, index) => (
                  <StatCard key={item.label} item={item} delay={index * 90} reducedMotion={reducedMotion} />
                ))}
              </div>
            </div>

            <div className="hero-panel" ref={heroPanelRef}>
              <div className="panel-heading">Сценарий работы Codex</div>
              <Terminal text={terminalText} />
              <div className="badge-grid">
                {BADGES.map((badge, index) => (
                  <div
                    key={badge}
                    className="badge reveal"
                    data-reveal
                    style={{ transitionDelay: `${index * 70}ms` }}
                  >
                    {badge}
                  </div>
                ))}
              </div>
            </div>
          </header>

          <section className="section" id="benefits">
            <div className="section-head">
              <span className="section-kicker">Преимущества</span>
              <h2>{copy.benefitsTitle}</h2>
              <p className="section-subtitle">
                Подключение с фокусом на безопасность, процессы и поддержку внедрения.
              </p>
            </div>
            <div className="grid-3">
              {BENEFITS.map((benefit, index) => (
                <div
                  key={benefit.title}
                  className="card reveal"
                  data-reveal
                  style={{ transitionDelay: `${index * 80}ms` }}
                >
                  <h3>{benefit.title}</h3>
                  <p>{benefit.text}</p>
                </div>
              ))}
            </div>
            <div className="feature-wall">
              {FEATURE_PILLS.map((feature, index) => (
                <span key={feature} className="feature-pill" style={{ animationDelay: `${index * 0.25}s` }}>
                  {feature}
                </span>
              ))}
            </div>
          </section>

          <section className="section alt" id="stack">
            <div className="section-head">
              <span className="section-kicker">Backend</span>
              <h2>{copy.stackTitle}</h2>
              <p className="section-subtitle">
                Готовая архитектура для заявок, ролей и административной работы.
              </p>
            </div>
            <div className="stack-grid">
              {STACK_ITEMS.map((item, index) => (
                <div
                  key={item.title}
                  className="stack-card reveal"
                  data-reveal
                  style={{ transitionDelay: `${index * 80}ms` }}
                >
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
            <div className="note">
              В репозитории есть SQL-схема для Supabase: таблицы, политики RLS и триггеры.
            </div>
          </section>

          <section className="section" id="process">
            <div className="section-head">
              <span className="section-kicker">Процесс</span>
              <h2>{copy.processTitle}</h2>
              <p className="section-subtitle">Понятный путь до запуска Business для команды.</p>
            </div>
            <div className="process-grid">
              {PROCESS_STEPS.map((step, index) => (
                <div
                  key={step.title}
                  className="step-card reveal"
                  data-reveal
                  style={{ transitionDelay: `${index * 80}ms` }}
                >
                  <div className="step-index">0{index + 1}</div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="section" id="codex">
            <div className="showcase">
              <div>
                <h2>Codex Live: обзор агентного режима</h2>
                <p>
                  Показываем, как агент берёт задачи, делает ревью и готовит патчи. Подходит для команд,
                  которым важны скорость и контроль качества.
                </p>
                <div className="steps">
                  <div className="step">Анализ репозитория и контекста</div>
                  <div className="step">Ревью и предложения по улучшениям</div>
                  <div className="step">Автоматический запуск тестов</div>
                  <div className="step">Патчи и фиксы в пайплайне</div>
                </div>
              </div>
              <div className="price-card">
                <div className="price-inner">
                  <h3>Live окно</h3>
                  <p>Формат демонстрации: задачи, ревью, тесты.</p>
                  <Terminal text={liveText} />
                </div>
              </div>
            </div>
          </section>

          <section className="section" id="lead-form">
            <div className="lead-grid">
              <div>
                <h2>{copy.formTitle}</h2>
                <p className="form-hint">{copy.formHint}</p>
                <div className="lead-aside">
                  <div className="lead-aside-card">
                    <h3>Что будет после заявки</h3>
                    <ul>
                      <li>Уточним команду и цели</li>
                      <li>Подготовим план подключения</li>
                      <li>Согласуем сроки и роли</li>
                    </ul>
                  </div>
                  <div className="lead-aside-card">
                    <h3>Связь</h3>
                    <p>Подключение через email или корпоративный чат.</p>
                    <p className="note">Google вход нужен для доступа к личному кабинету.</p>
                  </div>
                </div>
              </div>
              <div className="lead-form">
                {!isSupabaseConfigured ? (
                  <div className="notice">
                    Supabase не подключён. Добавьте переменные окружения и примените SQL-схему.
                  </div>
                ) : null}
                <form
                  onSubmit={handleLeadSubmit}
                  onChange={() => {
                    if (formStatus !== "idle") {
                      setFormStatus("idle");
                      setFormError(null);
                    }
                  }}
                >
                  <fieldset disabled={!isSupabaseConfigured || formStatus === "sending"}>
                    <div className="form-grid">
                      <label className="form-field">
                        Имя
                        <input type="text" name="name" placeholder="Алексей" required />
                      </label>
                      <label className="form-field">
                        Email
                        <input type="email" name="email" placeholder="name@company.com" required />
                      </label>
                      <label className="form-field">
                        Telegram (опционально)
                        <input type="text" name="telegram" placeholder="@username" />
                      </label>
                      <label className="form-field">
                        Кол-во мест
                        <input type="number" name="seats" min={1} defaultValue={1} required />
                      </label>
                      <label className="form-field">
                        Компания (опционально)
                        <input type="text" name="company" placeholder="Название" />
                      </label>
                    </div>
                    <label className="form-field" style={{ marginTop: "12px" }}>
                      Задачи / цели (опционально)
                      <textarea name="goal" rows={3} placeholder="Какие задачи хотите закрыть?"></textarea>
                    </label>
                    <div className="form-actions">
                      <button className="cta" type="submit">
                        {formStatus === "sending" ? "Отправляем..." : "Отправить заявку"}
                      </button>
                      <span className="form-hint">Ответим с планом подключения.</span>
                    </div>
                  </fieldset>
                  {formStatus === "success" ? (
                    <div className="form-status success">Заявка отправлена. Мы свяжемся в ближайшее время.</div>
                  ) : null}
                  {formStatus === "error" ? (
                    <div className="form-status error">{formError || "Не удалось отправить заявку."}</div>
                  ) : null}
                </form>
              </div>
            </div>
          </section>
        </>
      ) : null}

      {isAccount ? (
        <section className="section account">
          <div className="section-head">
            <span className="section-kicker">SellGPT</span>
            <h2>Личный кабинет</h2>
            <p className="section-subtitle">Управляйте заявками и доступом к данным.</p>
          </div>
          {!isSupabaseConfigured ? (
            <div className="notice">Подключите Supabase, чтобы активировать личный кабинет.</div>
          ) : !session ? (
            <div className="notice">
              Войдите через Google, чтобы получить доступ к личному кабинету.
              <div style={{ marginTop: "12px" }}>
                <button className="ghost" type="button" onClick={handleGoogleSignIn}>
                  Войти через Google
                </button>
              </div>
            </div>
          ) : (
            <div className="account-grid">
              <div className="account-card">
                <h3>Профиль</h3>
                <p>Почта: {session.user.email}</p>
                <p>Роль: {profile?.role ?? "user"}</p>
                <button className="ghost" type="button" onClick={handleSignOut}>
                  Выйти
                </button>
              </div>
              <div className="account-card">
                <h3>Админ-панель заявок</h3>
                <p className="note">Доступно пользователям с ролью admin.</p>
                {!isAdmin ? (
                  <div className="notice">
                    Вы вошли как {profile?.full_name || session.user.email}. Для доступа назначьте роль admin
                    в таблице profiles.
                  </div>
                ) : (
                  <div className="admin-panel">
                    <AdminStats leads={leads} />
                    
                    <div className="admin-search-bar">
                      <input
                        type="text"
                        className="admin-search-input"
                        placeholder="Поиск по имени, email, Telegram или компании..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <label className="select-field">
                        <select
                          value={statusFilter}
                          onChange={(event) => setStatusFilter(event.target.value as LeadStatus | "all")}
                        >
                          <option value="all">Все статусы</option>
                          {Object.entries(STATUS_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button
                        className="admin-btn primary"
                        onClick={() => exportLeadsToCSV(filteredLeads)}
                        disabled={filteredLeads.length === 0}
                      >
                        Экспорт CSV
                      </button>
                    </div>

                    {selectedLeads.size > 0 && (
                      <div className="lead-actions-bar">
                        <input
                          type="checkbox"
                          className="lead-checkbox"
                          checked={selectedLeads.size === filteredLeads.length && filteredLeads.length > 0}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                        />
                        <span className="lead-meta">
                          Выбрано: {selectedLeads.size}
                        </span>
                        <button className="lead-delete-btn" onClick={handleBulkDelete}>
                          Удалить выбранные
                        </button>
                      </div>
                    )}

                    <div className="admin-toolbar">
                      <div className="lead-meta">
                        {leadsLoading ? "Загрузка..." : `Показано: ${filteredLeads.length} из ${leads.length}`}
                      </div>
                    </div>

                    {leadsError ? <div className="form-status error">{leadsError}</div> : null}
                    {leadsLoading ? (
                      <div className="notice">Загружаем заявки...</div>
                    ) : filteredLeads.length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-state-icon">📭</div>
                        <h3>Нет заявок</h3>
                        <p>Попробуйте изменить фильтры или поисковый запрос</p>
                      </div>
                    ) : (
                      <div className="leads-grid">
                        {filteredLeads.map((lead) => (
                          <LeadCard
                            key={lead.id}
                            lead={lead}
                            onUpdate={handleLeadUpdate}
                            onDelete={handleLeadDelete}
                            isSelected={selectedLeads.has(lead.id)}
                            onSelect={handleSelectLead}
                            selectable={selectedLeads.size > 0}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      ) : null}

      {page === "terms" ? (
        <LegalPage
          title="Условия использования"
          description="Правила работы сервиса SellGPT и обработки заявок на подключение." 
          sections={TERMS_CONTENT}
        />
      ) : null}

      {page === "privacy" ? (
        <LegalPage
          title="Конфиденциальность"
          description="Политика работы с персональными данными и заявками в SellGPT."
          sections={PRIVACY_CONTENT}
        />
      ) : null}

      {authError ? <div className="toast error">{authError}</div> : null}

      <footer className="footer">
        <div>
          <div>© SellGPT. Все права защищены.</div>
          <div className="footer-links">
            <a href="/terms.html">Условия</a>
            <a href="/privacy.html">Конфиденциальность</a>
            <a href="/dashboard.html">Личный кабинет</a>
          </div>
        </div>
        <div>
          * Официальные возможности Business и лимиты зависят от условий OpenAI.
        </div>
      </footer>
    </div>
  );
}
