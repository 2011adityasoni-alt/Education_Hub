import { Redirect } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import { Badge, Button, CourseCard, CourseCardSkeleton, EmptyState, ErrorState, Input, Screen, Skeleton, space, TeacherCard, Text } from '@/design-system';

// DEV ONLY. Sample values below exist to preview components and are never shipped or served as data.
export default function Gallery() {
  const [email, setEmail] = useState('');
  if (!__DEV__) return <Redirect href="/" />;
  const noop = () => {};
  return (
    <Screen>
      <View style={{ gap: space[6] }}>
        <Text variant="display">Design gallery</Text>

        <View style={{ gap: space[3] }}>
          <Text variant="title2">Buttons</Text>
          <Button label="Enrol now" variant="accent" size="lg" fullWidth onPress={noop} />
          <Button label="Continue" onPress={noop} fullWidth />
          <Button label="Preview" variant="secondary" icon="play" onPress={noop} fullWidth />
          <Button label="Remind me" variant="ghost" onPress={noop} />
          <Button label="Request refund" variant="danger" onPress={noop} fullWidth />
          <Button label="Paying" loading onPress={noop} fullWidth />
          <Button label="Unavailable" disabled onPress={noop} fullWidth />
        </View>

        <View style={{ gap: space[3] }}>
          <Text variant="title2">Inputs</Text>
          <Input label="Email" leftIcon="mail-outline" placeholder="you@example.com" value={email} onChangeText={setEmail} helper="We send your login code here." />
          <Input label="Password" secureTextEntry placeholder="At least 8 characters" />
          <Input label="Mobile number" error="Enter a 10-digit mobile number." defaultValue="98765" />
        </View>

        <View style={{ gap: space[3] }}>
          <Text variant="title2">Course cards</Text>
          <CourseCard layout="row" title="JEE Physics Foundation" subtitle="Mechanics to Electrostatics" teacherNames={['Sample Teacher']} ratingAvg={4.6} ratingCount={128} priceInPaise={249900} mrpInPaise={499900} badge="Live batch" onPress={noop} />
          <CourseCard title="NEET Biology Crash Course" teacherNames={['Sample Teacher']} ratingAvg={0} ratingCount={0} priceInPaise={99900} mrpInPaise={99900} onPress={noop} />
        </View>

        <View style={{ gap: space[3] }}>
          <Text variant="title2">Teacher card</Text>
          <TeacherCard name="Sample Teacher" subject="Physics" ratingAvg={4.8} experienceYears={9} isVerified onPress={noop} />
        </View>

        <View style={{ gap: space[3] }}>
          <Text variant="title2">Badges</Text>
          <View style={{ flexDirection: 'row', gap: space[2] }}>
            <Badge label="Live now" tone="error" /><Badge label="Enrolled" tone="success" /><Badge label="New" /><Badge label="Hindi" tone="neutral" />
          </View>
        </View>

        <View style={{ gap: space[3] }}>
          <Text variant="title2">Loading</Text>
          <CourseCardSkeleton />
          <Skeleton height={14} width="60%" />
        </View>

        <EmptyState title="No tests yet" message="Tests for your enrolled courses show up here." actionLabel="Browse courses" onAction={noop} />
        <ErrorState message="We couldn't reach the server. Check your connection." requestId="req-1234" onRetry={noop} />
      </View>
    </Screen>
  );
}
