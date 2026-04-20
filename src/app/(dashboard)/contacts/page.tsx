'use client';

import { useState } from 'react';
import { ContactDetail } from '@/components/contacts/ContactDetail';
import { ContactForm } from '@/components/contacts/ContactForm';
import { ContactList } from '@/components/contacts/ContactList';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  useContacts,
  useCreateContact,
  useUpdateContact,
} from '@/lib/hooks/use-contacts';
import type { ClientContact } from '@/lib/types';

export default function ContactsPage(): JSX.Element {
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<ClientContact | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const contacts = useContacts();
  const createMutation = useCreateContact();
  const updateMutation = useUpdateContact(selected?.id ?? '');

  return (
    <PageWrapper
      title="Contacts"
      description="End-customers of your business."
      actions={
        <Button type="button" onClick={() => setIsCreateOpen(true)}>
          New contact
        </Button>
      }
    >
      {contacts.isLoading ? (
        <LoadingSpinner />
      ) : contacts.isError ? (
        <p className="text-sm text-red-700">{contacts.error.message}</p>
      ) : (
        <ContactList
          contacts={contacts.data ?? []}
          onRowClick={(c) => {
            setSelected(c);
            setIsEditing(false);
          }}
        />
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New contact</DialogTitle>
          </DialogHeader>
          <ContactForm
            onSubmit={async (values) => {
              await createMutation.mutateAsync(values);
              setIsCreateOpen(false);
            }}
            onCancel={() => setIsCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelected(null);
            setIsEditing(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit contact' : 'Contact'}</DialogTitle>
          </DialogHeader>
          {selected ? (
            isEditing ? (
              <ContactForm
                defaultValues={{
                  firstName: selected.firstName,
                  lastName: selected.lastName,
                  email: selected.email,
                  phone: selected.phone,
                  source: selected.source,
                }}
                onSubmit={async (values) => {
                  await updateMutation.mutateAsync(values);
                  setIsEditing(false);
                  setSelected(null);
                }}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <div className="space-y-4">
                <ContactDetail contact={selected} />
                <div className="flex justify-end">
                  <Button type="button" onClick={() => setIsEditing(true)}>
                    Edit
                  </Button>
                </div>
              </div>
            )
          ) : null}
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
