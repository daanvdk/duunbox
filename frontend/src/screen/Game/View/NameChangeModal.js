import React, { useState } from 'react';
import { Modal, Form, Group, Input, Button } from '../../../component';
import { useToasts, onEnter } from '../../../helpers';
import api from '../../../api';

export default function ChangeNameModal({ code, defaultName, onClose, ...props }) {
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
                    createToast(error.response.data.message, {
                        error: error.response.status !== 400,
                        warning: error.response.status === 400,
                    });
                }
            })
        );
    }

    return (
        <Modal title="Naam Aanpassen" onClose={onClose} {...props}>
            <Form onSubmit={onSubmit}>
                <Group label="Nieuwe Naam">
                    <Input autoFocus
                        value={name}
                        onChange={setName}
                        onKeyDown={onEnter(onSubmit)}
                    />
                    <Button primary icon="pen" disabled={name === ''}>
                        Naam Aanpassen
                    </Button>
                </Group>
            </Form>
        </Modal>
    );
}
