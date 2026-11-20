import { ThemeProvider } from '@/theme/ThemeProvider';
import { FavoritesProvider } from '@/favorites/FavoritesProvider';
import { HistoryProvider } from '@/history/HistoryProvider';
import { StreakProvider } from '@/streak/StreakProvider';
import { ImageCreatorProvider } from '@/imageCreator/ImageCreatorProvider';
import { AppShell } from '@/components/layout/AppShell';

export default function App() {
  return (
    <ThemeProvider>
      <FavoritesProvider>
        <HistoryProvider>
          <StreakProvider>
            <ImageCreatorProvider>
              <AppShell />
            </ImageCreatorProvider>
          </StreakProvider>
        </HistoryProvider>
      </FavoritesProvider>
    </ThemeProvider>
  );
}
