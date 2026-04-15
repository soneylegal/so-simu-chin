import { useEffect, useMemo, useState } from 'react';
import './App.css';

type AppDef = {
  id: string;
  name: string;
  icon: string;
  content: string;
};

type OpenWindow = {
  id: string;
  appId: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  minimized: boolean;
};

const APPS: AppDef[] = [
  {
    id: 'market',
    name: '超级应用商店',
    icon: '🛍️',
    content:
      '发布策略：优先接入教育、办公、短视频和跨境电商插件，为中国用户提供“开箱即用”的数字生活体验。',
  },
  {
    id: 'files',
    name: '文件管理器',
    icon: '📁',
    content:
      '支持按拼音排序、标签检索和云端同步，适配个人与企业文档工作流。',
  },
  {
    id: 'browser',
    name: '龙门浏览器',
    icon: '🌐',
    content:
      '内置加速模式和夜间阅读，针对本地门户、视频平台和学习网站进行了优化。',
  },
  {
    id: 'analytics',
    name: '商业看板',
    icon: '📊',
    content:
      '核心 KPI：日活、付费转化、次日留存。建议通过高校合作与开发者分成快速扩张。',
  },
  {
    id: 'settings',
    name: '设置中心',
    icon: '⚙️',
    content:
      '可切换简体中文/英文，支持品牌皮肤配置，便于企业客户二次定制。',
  },
  {
    id: 'terminal',
    name: '云终端',
    icon: '💻',
    content:
      '示例命令：deploy --region cn-shanghai --tier enterprise。可用于演示企业级部署故事线。',
  },
];

const WINDOW_W = 420;
const WINDOW_H = 280;

function App() {
  const [windows, setWindows] = useState<OpenWindow[]>([]);
  const [clock, setClock] = useState(() =>
    new Date().toLocaleString('zh-CN', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    }),
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setClock(
        new Date().toLocaleString('zh-CN', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
        }),
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const topZ = useMemo(
    () => windows.reduce((max, item) => Math.max(max, item.zIndex), 0),
    [windows],
  );

  const openApp = (app: AppDef) => {
    setWindows((prev) => {
      const existing = prev.find((item) => item.appId === app.id);
      if (existing) {
        return prev.map((item) =>
          item.appId === app.id
            ? { ...item, minimized: false, zIndex: topZ + 1 }
            : item,
        );
      }

      const offset = prev.length * 24;
      const nextWindow: OpenWindow = {
        id: `${app.id}-${Date.now()}`,
        appId: app.id,
        title: app.name,
        x: 100 + offset,
        y: 80 + offset,
        width: WINDOW_W,
        height: WINDOW_H,
        zIndex: topZ + 1,
        minimized: false,
      };

      return [...prev, nextWindow];
    });
  };

  const closeWindow = (id: string) => {
    setWindows((prev) => prev.filter((windowItem) => windowItem.id !== id));
  };

  const minimizeWindow = (id: string) => {
    setWindows((prev) =>
      prev.map((windowItem) =>
        windowItem.id === id ? { ...windowItem, minimized: true } : windowItem,
      ),
    );
  };

  const focusWindow = (id: string) => {
    setWindows((prev) =>
      prev.map((windowItem) =>
        windowItem.id === id ? { ...windowItem, zIndex: topZ + 1 } : windowItem,
      ),
    );
  };

  const restoreWindow = (id: string) => {
    setWindows((prev) =>
      prev.map((windowItem) =>
        windowItem.id === id
          ? { ...windowItem, minimized: false, zIndex: topZ + 1 }
          : windowItem,
      ),
    );
  };

  const moveWindow = (id: string, newX: number, newY: number) => {
    setWindows((prev) =>
      prev.map((windowItem) =>
        windowItem.id === id
          ? {
              ...windowItem,
              x: Math.max(16, Math.min(newX, window.innerWidth - windowItem.width - 16)),
              y: Math.max(16, Math.min(newY, window.innerHeight - windowItem.height - 76)),
            }
          : windowItem,
      ),
    );
  };

  const getAppById = (id: string) => APPS.find((app) => app.id === id);

  return (
    <div className="os-shell">
      <header className="top-bar">
        <h1>龙门OS 模拟器</h1>
        <p>为中国市场设计的可视化操作系统演示平台</p>
      </header>

      <main className="desktop" aria-label="desktop">
        <section className="icon-grid">
          {APPS.map((app) => (
            <button key={app.id} className="desktop-icon" onDoubleClick={() => openApp(app)}>
              <span className="icon-emoji" aria-hidden="true">
                {app.icon}
              </span>
              <span>{app.name}</span>
            </button>
          ))}
        </section>

        {windows
          .filter((windowItem) => !windowItem.minimized)
          .map((windowItem) => {
            const app = getAppById(windowItem.appId);

            if (!app) {
              return null;
            }

            return (
              <WindowFrame
                key={windowItem.id}
                data={windowItem}
                content={app.content}
                onClose={closeWindow}
                onMinimize={minimizeWindow}
                onFocus={focusWindow}
                onMove={moveWindow}
              />
            );
          })}
      </main>

      <footer className="taskbar">
        <div className="taskbar-start">龙门</div>
        <div className="taskbar-apps">
          {windows.length === 0 && <span className="hint">双击桌面图标以打开应用</span>}
          {windows.map((windowItem) => (
            <button
              key={windowItem.id}
              className={`task-item ${windowItem.minimized ? 'is-minimized' : ''}`}
              onClick={() =>
                windowItem.minimized ? restoreWindow(windowItem.id) : minimizeWindow(windowItem.id)
              }
            >
              {windowItem.title}
            </button>
          ))}
        </div>
        <div className="clock">{clock}</div>
      </footer>
    </div>
  );
}

type WindowFrameProps = {
  data: OpenWindow;
  content: string;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onFocus: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
};

function WindowFrame({ data, content, onClose, onMinimize, onFocus, onMove }: WindowFrameProps) {
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!dragging) {
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      onMove(data.id, event.clientX - data.width / 2, event.clientY - 20);
    };

    const handleMouseUp = () => setDragging(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [data.id, data.width, dragging, onMove]);

  return (
    <article
      className="window"
      style={{
        left: data.x,
        top: data.y,
        width: data.width,
        height: data.height,
        zIndex: data.zIndex,
      }}
      onMouseDown={() => onFocus(data.id)}
    >
      <header className="window-title" onMouseDown={() => setDragging(true)}>
        <strong>{data.title}</strong>
        <div className="window-actions">
          <button onClick={() => onMinimize(data.id)} aria-label="minimize window">
            —
          </button>
          <button onClick={() => onClose(data.id)} aria-label="close window">
            ✕
          </button>
        </div>
      </header>
      <section className="window-content">
        <p>{content}</p>
      </section>
    </article>
  );
}

export default App;
