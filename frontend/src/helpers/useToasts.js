import { useContext, useCallback } from 'react';
import { ToastContext } from '../component/Toasts';
import { DateTime } from 'luxon';

let nextId = 1;

function getNextId() {
    return nextId++;
}

export default function useToasts() {
    const [, setToasts] = useContext(ToastContext);
    return useCallback((message, options = {}) => setToasts((toasts) => [...toasts, {
        ...options,
        id: getNextId(),
        message,
        createdAt: DateTime.local(),
        state: 'new',
    }]), [setToasts]);
}
