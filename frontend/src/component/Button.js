import React from 'react';
import styled, { css } from 'styled-components';
import Icon from './Icon';
import theme from '../theme';

export const ButtonIcon = styled(Icon)`
    font-size: ${({ size = '0.9em' }) => size};
    line-height: 1;
    position: absolute;
    left: 0.7rem;
    top: 50%;
    transform: translateY(-50%);
`;

const components = {
    button: styled.button`
        display: block;
        width: 100%;
        margin-bottom: 1rem;
        &:last-child {
            margin-bottom: 0;
        }

        background-color: ${({ color, primary }) => color ? color : primary ? theme.primaryColor : theme.bgColorN1};
        color: ${({ color, primary }) => color ? theme.bgColor : primary ? theme.bgColor : theme.textColorN1};
        border: unset;
        font-size: 1rem;
        font-weight: bold;
        padding: 0.5rem ${({ icon }) => icon ? 2 : 0.5}rem;
        text-align: center;
        border-radius: 0.5rem;
        ${({ disabled }) => disabled ? css`
            cursor: not-allowed;
            opacity: 0.8;
        ` : css`
            cursor: pointer;
            &:hover, &:active, &:focus {
                background-color: ${({ hoverColor, primary }) => hoverColor ? hoverColor : primary ? theme.primaryColorP1 : theme.bgColorN2};
                color: ${({ hoverColor, primary }) => hoverColor ? theme.bgColorN1 : primary ? theme.bgColorP1 : theme.textColorN2};
            }
        `}
        transition: opacity 300ms ease, background-color 300ms ease, color 300ms ease;

        position: relative;
    `,
    a: styled.a`
        display: block;
        width: 100%;
        margin-bottom: 1rem;
        &:last-child {
            margin-bottom: 0;
        }

        background-color: ${({ color, primary }) => color ? color : primary ? theme.primaryColor : theme.bgColorN1};
        color: ${({ color, primary }) => color ? theme.bgColor : primary ? theme.bgColor : theme.textColorN1};
        border: unset;
        font-size: 1rem;
        font-weight: bold;
        padding: 0.5rem 0.5rem 0.5rem ${({ icon }) => icon ? 2 : 0.5}rem;
        text-align: center;
        border-radius: 0.5rem;
        ${({ disabled }) => disabled ? css`
            cursor: not-allowed;
            opacity: 0.8;
        ` : css`
            cursor: pointer;
            &:hover, &:active, &:focus {
                background-color: ${({ hoverColor, primary }) => hoverColor ? hoverColor : primary ? theme.primaryColorP1 : theme.bgColorN2};
                color: ${({ hoverColor, primary }) => hoverColor ? theme.bgColorN1 : primary ? theme.bgColorP1 : theme.textColorN2};
            }
        `}
        transition: opacity 300ms ease, background-color 300ms ease, color 300ms ease;

        position: relative;
        text-decoration: none;
    `,
};

export default function Button({ icon, as = 'button', children, ...props }) {
    const Component = components[as];

    if (typeof icon === 'string') {
        icon = { name: icon };
    }

    return (
        <Component icon={!!icon} {...props}>
            {icon && <ButtonIcon {...icon} />}
            {children}
        </Component>
    );
}
