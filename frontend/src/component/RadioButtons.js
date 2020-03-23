import React from 'react';
import theme from '../theme';
import styled from 'styled-components';
import { ButtonIcon } from './Button';

const Container = styled.div`
    margin-bottom: 1rem;
    &:last-child {
        margin-bottom: 0;
    }

    background-color: ${theme.bgColorN1};
    text-align: center;
    border-radius: 0.75rem;

    display: flex;
    flex-direction: ${({ vertical }) => vertical ? 'column' : 'row'};
    position: relative;
`;

const Highlight = styled.div`
    position: absolute;
    ${({ vertical, active, options }) => vertical ? `
        left: 0.25rem;
        top: calc(${100 * active / options}% + 0.25rem);
        width: calc(100% - 0.5rem);
        height: calc(${100 / options}% - 0.5rem);
    ` : `
        left: calc(${100 * active / options}% + 0.25rem);
        top: 0.25rem;
        width: calc(${100 / options}% - 0.5rem);
        height: calc(100% - 0.5rem);
    `}
    background-color: ${theme.primaryColor};
    border-radius: 0.5rem;
    transition: left 300ms ease, top 300ms ease;
`;

const Button = styled.button`
    flex: 1 1 0;
    position: relative;

    cursor: pointer;
    margin: 0.25rem;
    padding: 0.5rem ${({ icon }) => icon ? 2 : 0.5}rem;
    border: none;
    outline: none;
    background-color: transparent;
    color: ${({ active }) => active ? theme.bgColor : theme.textColorN2};
    font-size: 1rem;
    font-weight: bold;
    text-align: center;
    transition: color 300ms ease;
`;

export default function RadioButtons({ vertical, value, onChange, options }) {
    const active = options.findIndex((option) => option.value === value);
    return (
        <Container vertical={vertical}>
            {active !== -1 && (
                <Highlight vertical={vertical} active={active} options={options.length} />
            )}
            {options.map(({ value, content, icon }, i) => {
                if (typeof icon === 'string') {
                    icon = { name: icon };
                }
                return (
                    <Button
                        key={i}
                        active={i === active}
                        icon={!!icon}
                        onClick={(e) => {
                            e.preventDefault();
                            onChange(value);
                        }}
                    >
                        {icon && <ButtonIcon {...icon} />}
                        {content}
                    </Button>
                );
            })}
        </Container>
    );
}
