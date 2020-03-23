import React, { useState } from 'react';
import { Modal, Form, Group, Input, Button } from '../../../component';
import { useTranslations, useToasts, onEnter } from '../../../helpers';
import api from '../../../api';

export default function ChangeNameModal({ code, defaultName, onClose, ...props }) {
    const t = useTranslations();
    const [name, setName] = useState(defaultName);
    const createToast = useToasts();

    function onSubmit(e) {
        e.preventDefault();
        if (name === '') {
            return;
        }

        return (
            api.post(`game/${code}/join/`, { name })
            .then(() => {
                localStorage.setItem('name', name);
                onClose();
            })
            .catch((error) => {
                if (error.response && error.response.data) {
                    if (error.response.status === 400) {
                        createToast(t('game.create.error.nameTaken'), { warning: true });
                    } else {
                        createToast(t('error.unknown'), { error: true });
                    }
                }
            })
        );
    }

    return (
        <Modal title={t('game.lobby.changeName.title')} onClose={onClose} {...props}>
            <Form onSubmit={onSubmit}>
                <Group label={t('game.lobby.changeName.name.label')}>
                    <Input autoFocus
                        value={name}
                        onChange={setName}
                        onKeyDown={onEnter(onSubmit)}
                    />
                    <Button primary icon="pen" disabled={name === ''}>
                        {t('game.lobby.changeName.changeButton')}
                    </Button>
                </Group>
            </Form>
        </Modal>
    );
}
