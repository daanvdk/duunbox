import React, { useState, useEffect } from 'react';
import { Form, Group, Button, RadioButtons } from '../../../component';
import { useTranslations } from '../../../helpers';

function GameField({ game, field, value, onChange }) {
    const t = useTranslations();

    let node = null;
    if (field.type === 'choice') {
        node = (
            <RadioButtons
                value={value}
                onChange={onChange}
                options={field.choices.map((value) => ({
                    value,
                    content: t(`game.${game}.${value}`),
                }))}
            />
        );
    }

    if (field.label) {
        node = (
            <Group label={t(`game.${game}.${field.label}`)}>
                {node}
            </Group>
        );
    }

    return node;
}

export default function GameForm({ game, form, onSubmit }) {
    const t = useTranslations();
    const [values, setValues] = useState([])

    useEffect(() => {
        if (values.length !== form.length) {
            const newValues = [];
            for (let i = 0; i < values.length; i++) {
                newValues.push(undefined);
            }
            setValues(newValues);
        }
    }, [form, values.length]);

    function onFormSubmit(e) {
        e.preventDefault();
        if (values.every((value) => value !== undefined)) {
            onSubmit(values);
        }
    }

    return (
        <Form onSubmit={onFormSubmit}>
            {form.map((field, i) => (
                <GameField
                    key={i}
                    game={game}
                    field={field}
                    value={values[i]}
                    onChange={(value) => setValues([
                        ...values.slice(0, i),
                        value,
                        ...values.slice(i + 1),
                    ])}
                />
            ))}
            <Button primary icon="check">
                {t('game.form.submitButton')}
            </Button>
        </Form>
    );
}
