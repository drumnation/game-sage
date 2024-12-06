import { render, screen } from './test/testUtils';
import App from './App';

describe('App', () => {
  it('renders the GameSage title', () => {
    render(<App />);
    const titleElement = screen.getByText(/GameSage/i);
    expect(titleElement).toBeInTheDocument();
  });

  it('renders with the correct theme', () => {
    render(<App />);
    const header = screen.getByRole('banner');
    const styles = window.getComputedStyle(header);
    expect(styles.backgroundColor).toBeDefined();
  });
}); 