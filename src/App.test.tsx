import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

describe('龙门OS 模拟器', () => {
  it('renderiza o título principal', () => {
    render(<App />);
    expect(screen.getByText('龙门OS 模拟器')).toBeInTheDocument();
  });

  it('abre uma janela ao dar duplo clique no ícone', () => {
    render(<App />);
    const icon = screen.getByText('超级应用商店');

    fireEvent.doubleClick(icon.closest('button')!);

    expect(screen.getByText('发布策略：优先接入教育、办公、短视频和跨境电商插件，为中国用户提供“开箱即用”的数字生活体验。')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'minimize window' })).toBeInTheDocument();
  });
});
