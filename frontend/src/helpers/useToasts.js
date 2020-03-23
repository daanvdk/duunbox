import { useContext } from 'react';
import { ToastContext } from '../component/Toasts';
import { DateTime } from 'luxon';

let nextId = 1;

function getNextId() {
    return nextId++;
}

export default function useToasts(defaultOptions = {}) {
    const [, setToasts] = useContext(ToastContext);
    return (message, options = {}) => setToasts((toasts) => [...toasts, {
        ...defaultOptions,
        ...options,
        id: getNextId(),
        message,
        createdAt: DateTime.local(),
        state: 'new',
    }]);
}
