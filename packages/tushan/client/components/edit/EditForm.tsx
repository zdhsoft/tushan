import { Button, Form, Message, Space } from '@arco-design/web-react';
import React, { useMemo, useState } from 'react';
import type { BasicRecord } from '../../api';
import { useCreate } from '../../api/useCreate';
import { useUpdate } from '../../api/useUpdate';
import { useResourceContext } from '../../context/resource';
import { useSendRequest } from '../../hooks/useSendRequest';
import type { FieldHandler } from '../field/factory';
import { SubmitButton } from '../SubmitButton';

export interface EditFormProps {
  fields: FieldHandler[];
  record: BasicRecord | null; // edit or create
  onSuccess?: (values: BasicRecord) => void;
  onCancel?: () => void;
}
export const EditForm: React.FC<EditFormProps> = React.memo((props) => {
  const isCreate = props.record === null;
  const defaultValues = props.record ?? {};
  const [values, setValues] = useState<{}>(defaultValues);
  const [create] = useCreate();
  const [updateOne] = useUpdate();
  const resource = useResourceContext();

  const items = useMemo(() => {
    return props.fields.map((handler) => handler('edit'));
  }, [props.fields]);

  const handleSubmit = useSendRequest(async () => {
    try {
      if (isCreate) {
        await create(resource, {
          data: { ...values },
        });
      } else {
        await updateOne(resource, {
          id: (values as BasicRecord).id,
          data: { ...values },
        });
      }

      props.onSuccess?.(values as BasicRecord);
    } catch (err) {
      Message.error(String(err));
    }
  });

  return (
    <Form layout="vertical">
      {items.map((item, i) => {
        if (item.source === 'id') {
          // Dont render id field
          return null;
        }

        return (
          <Form.Item key={item.source} label={item.title}>
            {item.render(values[item.source], (val) => {
              setValues((state) => ({
                ...state,
                [item.source]: val,
              }));
            })}
          </Form.Item>
        );
      })}

      <Form.Item>
        <Space>
          <SubmitButton type="primary" onClick={handleSubmit}>
            {isCreate ? 'Create' : 'Save'}
          </SubmitButton>
          <Button type="default" onClick={props.onCancel}>
            Cancel
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
});
EditForm.displayName = 'EditForm';