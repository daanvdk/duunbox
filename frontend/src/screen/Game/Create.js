import React, { useState, useRef, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { Form, Icon, Group, Input, HSplit, Button } from '../../component';
import api from '../../api';
import theme from '../../theme';
import { useTranslations, useToasts, onEnter } from '../../helpers';

const Title = styled.h1`
    font-size: 1.5rem;
    font-weight: bold;
    color: ${theme.textColor};
    margin: 2rem 0 0.25rem;
`;

const UnderTitle = styled.h2`
    font-size: 0.75rem;
    font-weight: normal;
    font-style: italic;
    color: ${theme.textColorN2};
    margin: 0 0 1.5rem;
`;

export default function GameCreateScreen({ defaultCode, afterSubmit }) {
    const t = useTranslations();
    const [name, setName] = useState('');
    const [code, setCode] = useState(defaultCode || '');
    const createToast = useToasts();

    const history = useHistory();

    const nameRef = useRef();
    const codeRef = useRef();

    useEffect(() => {
        const name = localStorage.getItem('name');
        if (name === null) {
            nameRef.current.focus();
        } else {
            setName(name);
            (codeRef.current || nameRef.current).focus();
        }
    }, []);

    function onSubmit(e) {
        e.preventDefault();
        if (name === '') {
            return;
        }

        // Create game
        const promise = (
            api.post(code === '' ? 'room/' : `room/${code}/join/`, { name })
            .then(({ data: { code } }) => {
                localStorage.setItem('name', name);
                history.push(`/${code}`);
            })
            .catch((error) => {
                if (error.response && error.response.data) {
                    if (error.response.status === 400) {
                        createToast(t('game.create.error.nameTaken'), { warning: true });
                    } else if (error.response.status === 404) {
                        createToast(t('game.create.error.gameNotFound'), { warning: true });
                    } else {
                        createToast(t('error.unknown'), { error: true });
                    }
                }
            })
        );
        if (afterSubmit) {
            promise.then(afterSubmit);
        }
    }

    return (
        <>
            <Title>
                <Icon name="box" size={0.75} style={{
                    position: 'relative',
                    top: '-0.075em',
                    marginRight: '0.375em',
                }} />
                {t('main.title')}
            </Title>
            <UnderTitle>{t('main.underTitle')}</UnderTitle>
            <Form onSubmit={onSubmit}>
                <Group label={t('game.create.name.label')} ref={nameRef}>
                    <Input autoFocus
                        value={name}
                        onChange={setName}
                        onKeyDown={onEnter((e) => {
                            if (defaultCode) {
                                onSubmit(e);
                            } else {
                                e.preventDefault();
                                codeRef.current.focus();
                            }
                        })}
                        innerRef={nameRef}
                    />
                </Group>
                {!defaultCode && (
                    <Group label={t('game.create.code.label')}>
                        <Input
                            value={code}
                            onChange={setCode}
                            onKeyDown={onEnter(onSubmit)}
                            style={{ textTransform: 'uppercase' }}
                            innerRef={codeRef}
                        />
                    </Group>
                )}
                <HSplit>
                    <Button primary
                        icon={code === '' ? 'plus' : 'sign-in-alt'}
                        disabled={name === ''}
                    >
                        {code === '' ? t('game.create.createButton') : t('game.create.joinButton')}
                    </Button>
                </HSplit>
            </Form>
        </>
    );
}
