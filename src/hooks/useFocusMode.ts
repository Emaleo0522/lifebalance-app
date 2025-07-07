import { useFocusContext } from '../context/FocusContext';

export type { FocusSession, DistractionSource } from '../context/FocusContext';

export const useFocusMode = () => {
  const context = useFocusContext();
  return context;
};