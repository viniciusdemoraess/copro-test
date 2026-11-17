import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { IPCA } from '@/types/ipca';

const ipcaSchema = z.object({
  ano: z.coerce.number().int().min(2000).max(new Date().getFullYear() + 5),
  percentual: z.coerce.number().min(0).max(100),
});

interface IPCAModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: z.infer<typeof ipcaSchema>) => Promise<void>;
  ipca?: IPCA;
  isLoading?: boolean;
}

export function IPCAModal({
  open,
  onOpenChange,
  onSubmit,
  ipca,
  isLoading,
}: IPCAModalProps) {
  const form = useForm<z.infer<typeof ipcaSchema>>({
    resolver: zodResolver(ipcaSchema),
    defaultValues: {
      ano: ipca?.ano || new Date().getFullYear(),
      percentual: ipca?.percentual || 0,
    },
  });

  useEffect(() => {
    if (ipca) {
      form.reset({
        ano: ipca.ano,
        percentual: ipca.percentual,
      });
    }
  }, [ipca, form]);

  const handleSubmit = async (data: z.infer<typeof ipcaSchema>) => {
    await onSubmit(data);
    if (!isLoading) {
      form.reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {ipca ? 'Editar IPCA' : 'Adicionar IPCA'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="ano"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ano</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="2000"
                      max={new Date().getFullYear() + 5}
                      placeholder="2024"
                      disabled={!!ipca || isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="percentual"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Percentual (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      placeholder="5.50"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
