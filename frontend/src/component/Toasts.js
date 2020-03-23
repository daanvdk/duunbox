import React, { createContext, useState } from 'react';
import styled from 'styled-components';
import { DateTime } from 'luxon';
import useInterval from '../helpers/useInterval';
import theme from '../theme';
import Icon from './Icon';

const ToastContainer = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    padding: 0 0.5rem;
    z-index: 200;
`;

const Toast = styled.div`
    max-width: 600px;
    ${({ state }) => ['new', 'deleting'].includes(state) ? `
        opacity: 0;
        transform: scale(0);
        margin: -0.5rem auto -1.5rem;
    ` : `
        margin: 0.5rem auto 0;
    `}
    transition: opacity 300ms ease, transform 300ms ease, margin 300ms ease;

    position: relative;
    padding: 0 0.5rem;
    font-size: 1rem;
    height: 2rem;
    line-height: 2rem;
    border-radius: 0.25rem;
    font-weight: bold;
    text-align: center;
    color: ${({ highlight, warning, error }) => (
        highlight
        ? theme.highlightTextColor
        : warning
        ? theme.warningTextColor
        : error
        ? theme.errorTextColor
        : theme.textColorN2
    )};
    background-color: ${({ highlight, warning, error }) => (
        highlight
        ? theme.highlightColor
        : warning
        ? theme.warningColor
        : error
        ? theme.errorColor
        : theme.bgColorN2
    )};
    box-shadow: 0 1px 8px rgba(0, 0, 0, 0.1);
`;

const DeleteIcon = styled((props) => <Icon name="times" {...props} />)`
    cursor: pointer;
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    opacity: 0.25;
    &:hover {
        opacity: 1;
    }
    transition: opacity 300ms ease;
`;

export const ToastContext = createContext();

export default function Toasts({ children }) {
    const [toasts, setToasts] = useState([]);

    useInterval(() => {
        const now = DateTime.local();
        setToasts((toasts) => (
            toasts
            .map((toast) => {
                const duration = toast.duration || 3000;
                const diff = now.diff(toast.createdAt).as('milliseconds');
                return { ...toast, state: (
                    toast.state !== 'deleting' && diff < duration
                    ? 'current'
                    : diff < duration + 1000
                    ? 'deleting'
                    : 'deleted'
                ) };
            })
            .filter(({ state }) => state !== 'deleted')
        ));
    }, 100);

    return (
        <ToastContext.Provider value={[toasts, setToasts]}>
            {children}
            <ToastContainer>
                {toasts.map(({ id, message, ...options }) => (
                    <Toast key={id} {...options}>
                        {message}
                        <DeleteIcon onClick={() => setToasts((toasts) => (
                            toasts.map((toast) => (
                                toast.id === id
                                ? { ...toast, state: 'deleting' }
                                : toast
                            ))
                        ))} />
                    </Toast>
                ))}
            </ToastContainer>
        </ToastContext.Provider>
    );
}
