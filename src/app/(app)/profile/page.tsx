'use client';
import { useUser } from '@/firebase';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User as UserIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useActionState, useTransition } from 'react';
import { updateProfile } from './actions';
import { toast } from '@/hooks/use-toast';
import { useEffect } from 'react';

const profileSchema = z.object({
  displayName: z.string().min(2, 'Name is too short.'),
});

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName ?? '',
    },
  });

  const [state, formAction] = useActionState(updateProfile, {
    success: false,
    error: null,
  });

  useEffect(() => {
    if (state.success) {
      toast({ title: 'Profile updated successfully!' });
    }
    if (state.error) {
      toast({
        title: 'Update failed',
        description: state.error,
        variant: 'destructive',
      });
    }
  }, [state]);

  useEffect(() => {
    if (user) {
      form.reset({ displayName: user.displayName ?? '' });
    }
  }, [user, form]);
  
  const onSubmit = form.handleSubmit((data) => {
    startTransition(() => {
        const formData = new FormData();
        formData.append('displayName', data.displayName);
        formAction(formData);
    })
  });

  if (isUserLoading) {
    return <div>Loading user profile...</div>;
  }

  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Your Profile"
        description="Manage your account settings and personal information."
      />
      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-1 flex flex-col items-center gap-4">
            <Avatar className="h-32 w-32">
              <AvatarImage src={user.photoURL ?? ''} />
              <AvatarFallback>
                <UserIcon className="h-16 w-16" />
              </AvatarFallback>
            </Avatar>
            <Button variant="outline">Change Photo</Button>
          </div>
          <div className="md:col-span-2 space-y-6">
            <Form {...form}>
              <form onSubmit={onSubmit} className="space-y-4">
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <Label>Display Name</Label>
                      <FormControl>
                        <Input placeholder="Your Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input value={user.email ?? ''} disabled />
                </div>
                
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </Form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
