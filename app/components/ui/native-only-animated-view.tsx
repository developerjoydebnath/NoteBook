import * as React from 'react';
import { View, ViewProps } from 'react-native';

/**
 * This component is used to wrap animated views.
 * Simplified version without react-native-reanimated for Expo Go compatibility.
 * @param props - The props for the view.
 * @returns A plain View wrapper.
 */
function NativeOnlyAnimatedView({
  children,
  entering,
  exiting,
  ...props
}: ViewProps & {
  entering?: unknown;
  exiting?: unknown;
  children?: React.ReactNode;
}) {
  return <View {...props}>{children}</View>;
}

export { NativeOnlyAnimatedView };
