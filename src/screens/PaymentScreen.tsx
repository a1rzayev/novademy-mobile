import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppSelector } from '../store';

interface PaymentDetails {
  packageId: string;
  amount: number;
  packageName: string;
}

const PaymentScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const navigation = useNavigation();
  const route = useRoute();
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    const details = route.params as PaymentDetails;
    if (!details) {
      setError('No payment details found. Please select a package first.');
      return;
    }

    if (!details.packageId || !details.amount || !details.packageName) {
      setError('Invalid payment details. Please try selecting the package again.');
      return;
    }

    setPaymentDetails(details);
  }, [route.params]);

  const handlePayment = async () => {
    if (!paymentDetails || !user) {
      setError('Payment details or user information is missing. Please try again.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Store purchase in local storage or state management
      // For now, we'll just show a success message
      Alert.alert(
        'Payment Successful',
        `Thank you for your purchase!\n\nYour payment of ${paymentDetails.amount} AZN for ${paymentDetails.packageName} has been processed successfully.\n\n(Note: This is a demo payment. No actual payment was processed.)`,
        [
          {
            text: 'Go to Dashboard',
            onPress: () => {
              // @ts-ignore - we know this navigation exists
              navigation.reset({
                index: 0,
                routes: [
                  { 
                    name: 'Main',
                    state: {
                      routes: [
                        {
                          name: 'MainTabs',
                          state: {
                            routes: [
                              { name: 'Packages' }
                            ]
                          }
                        }
                      ]
                    }
                  }
                ]
              });
            }
          }
        ]
      );
      
    } catch (error: any) {
      console.error('Payment error:', error);
      setError('Failed to process payment. Please try again.');
      Alert.alert('Error', 'Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={48} color="#ff4d4f" />
          <Text style={styles.errorTitle}>Payment Error</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              // @ts-ignore - we know this navigation exists
              navigation.reset({
                index: 0,
                routes: [
                  { 
                    name: 'Main',
                    state: {
                      routes: [
                        {
                          name: 'MainTabs',
                          state: {
                            routes: [
                              { name: 'Packages' }
                            ]
                          }
                        }
                      ]
                    }
                  }
                ]
              });
            }}
          >
            <Text style={styles.buttonText}>Back to Packages</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!paymentDetails) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading payment details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Payment Details</Text>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Package:</Text>
            <Text style={styles.detailValue}>{paymentDetails.packageName}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount:</Text>
            <Text style={styles.detailValue}>{paymentDetails.amount} AZN</Text>
          </View>
          
          <Text style={styles.demoText}>
            This is a demo payment. No actual payment will be processed.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handlePayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name="credit-card" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Proceed to Payment (Demo)</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => {
            // @ts-ignore - we know this navigation exists
            navigation.reset({
              index: 0,
              routes: [
                { 
                  name: 'Main',
                  state: {
                    routes: [
                      {
                        name: 'MainTabs',
                        state: {
                          routes: [
                            { name: 'Packages' }
                          ]
                        }
                      }
                    ]
                  }
                }
              ]
            });
          }}
        >
          <Text style={styles.linkButtonText}>Cancel and Return to Packages</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  detailsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  detailValue: {
    fontSize: 16,
    color: '#666',
  },
  demoText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  linkButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff4d4f',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});

export default PaymentScreen; 