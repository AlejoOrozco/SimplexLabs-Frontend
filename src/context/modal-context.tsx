'use client';

import { Info, TriangleAlert, XCircle } from 'lucide-react';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type ConfirmVariant = 'danger' | 'warning';
type AlertType = 'info' | 'warning' | 'error';

interface ConfirmModalConfig {
  title: string;
  description: string;
  consequences?: string[];
  confirmLabel: string;
  confirmVariant?: ConfirmVariant;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

interface AlertModalConfig {
  title: string;
  description: string;
  type?: AlertType;
  onClose?: () => void;
}

interface FormModalConfig {
  title: string;
  description?: string;
  children: ReactNode;
  onClose?: () => void;
}

type ModalState =
  | { type: 'none' }
  | { type: 'confirm'; config: ConfirmModalConfig }
  | { type: 'alert'; config: AlertModalConfig }
  | { type: 'form'; config: FormModalConfig };

interface ModalContextValue {
  openConfirm: (config: ConfirmModalConfig) => void;
  openAlert: (config: AlertModalConfig) => void;
  openFormModal: (config: FormModalConfig) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: ReactNode }): JSX.Element {
  const [modalState, setModalState] = useState<ModalState>({ type: 'none' });
  const [isConfirming, setIsConfirming] = useState(false);

  const closeModal = useCallback((): void => {
    setModalState({ type: 'none' });
    setIsConfirming(false);
  }, []);

  const openConfirm = useCallback((config: ConfirmModalConfig): void => {
    setModalState({ type: 'confirm', config });
  }, []);

  const openAlert = useCallback((config: AlertModalConfig): void => {
    setModalState({ type: 'alert', config });
  }, []);

  const openFormModal = useCallback((config: FormModalConfig): void => {
    setModalState({ type: 'form', config });
  }, []);

  const value = useMemo<ModalContextValue>(
    () => ({ openConfirm, openAlert, openFormModal, closeModal }),
    [openAlert, openConfirm, openFormModal, closeModal],
  );

  const handleOpenChange = (open: boolean): void => {
    if (open) return;
    if (modalState.type === 'confirm') return;
    closeModal();
  };

  const handleConfirm = async (): Promise<void> => {
    if (modalState.type !== 'confirm' || isConfirming) return;
    setIsConfirming(true);
    try {
      await modalState.config.onConfirm();
      closeModal();
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
      <Dialog open={modalState.type !== 'none'} onOpenChange={handleOpenChange}>
        {modalState.type === 'confirm' ? (
          <DialogContent
            onEscapeKeyDown={(event) => event.preventDefault()}
            onPointerDownOutside={(event) => event.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle>{modalState.config.title}</DialogTitle>
              <DialogDescription>{modalState.config.description}</DialogDescription>
            </DialogHeader>
            {modalState.config.consequences?.length ? (
              <ul className="list-disc space-y-1 pl-5 text-sm text-text-secondary">
                {modalState.config.consequences.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                disabled={isConfirming}
                onClick={() => {
                  modalState.config.onCancel?.();
                  closeModal();
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant={modalState.config.confirmVariant === 'warning' ? 'outline' : 'destructive'}
                disabled={isConfirming}
                onClick={() => void handleConfirm()}
              >
                {isConfirming ? 'Working...' : modalState.config.confirmLabel}
              </Button>
            </DialogFooter>
          </DialogContent>
        ) : null}

        {modalState.type === 'alert' ? (
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {modalState.config.type === 'error' ? <XCircle className="h-4 w-4 text-error" /> : null}
                {modalState.config.type === 'warning' ? (
                  <TriangleAlert className="h-4 w-4 text-warning" />
                ) : null}
                {(!modalState.config.type || modalState.config.type === 'info') ? (
                  <Info className="h-4 w-4 text-info" />
                ) : null}
                {modalState.config.title}
              </DialogTitle>
              <DialogDescription>{modalState.config.description}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                onClick={() => {
                  modalState.config.onClose?.();
                  closeModal();
                }}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        ) : null}

        {modalState.type === 'form' ? (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{modalState.config.title}</DialogTitle>
              {modalState.config.description ? (
                <DialogDescription>{modalState.config.description}</DialogDescription>
              ) : null}
            </DialogHeader>
            <div>{modalState.config.children}</div>
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  modalState.config.onClose?.();
                  closeModal();
                }}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        ) : null}
      </Dialog>
    </ModalContext.Provider>
  );
}

export function useModal(): ModalContextValue {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}
