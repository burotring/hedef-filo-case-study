import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import { useCaseDetail } from '../hooks';
type RootStackParamList = {
  CaseList: undefined;
  CreateCase: undefined;
  CaseDetails: { caseId: string };
  CaseStatusTimeline: { caseId: string };
  Survey: { caseId: string };
  Notifications: undefined;
};
type SurveyScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Survey'>;
type SurveyScreenRouteProp = RouteProp<RootStackParamList, 'Survey'>;
interface Props {
  navigation: SurveyScreenNavigationProp;
  route: SurveyScreenRouteProp;
}
export const SurveyScreen: React.FC<Props> = ({ navigation, route }) => {
  const { getCaseTypeLabel } = useAppContext();
  const { caseId } = route.params;
  const { caseDetail, loading, error, createSurvey } = useCaseDetail(caseId);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const handleRatingSelect = (rating: number) => {
    setSelectedRating(rating);
  };
  const handleSubmit = async () => {
    if (selectedRating === null) {
      Alert.alert('Uyarı', 'Lütfen bir puan seçiniz.');
      return;
    }
    try {
      setSubmitting(true);
      await createSurvey({
        rating: selectedRating,
        comment: comment.trim() || undefined
      });
      Alert.alert(
        'Teşekkürler!', 
        `Anketiniz başarıyla kaydedildi. Verdiğiniz puan: ${selectedRating}/5`,
        [
          {
            text: 'Tamam',
            onPress: () => navigation.navigate('CaseDetails', { caseId }),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Anket kaydedilirken hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };
  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return 'Çok Kötü';
      case 2: return 'Kötü';
      case 3: return 'Orta';
      case 4: return 'İyi';
      case 5: return 'Mükemmel';
      default: return '';
    }
  };
  const getRatingColor = (rating: number) => {
    switch (rating) {
      case 1: return '#E74C3C';
      case 2: return '#F39C12';
      case 3: return '#F1C40F';
      case 4: return '#2ECC71';
      case 5: return '#27AE60';
      default: return '#BDC3C7';
    }
  };
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Vaka bilgileri yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }
  if (error || !caseDetail) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF3B30" />
          <Text style={styles.errorTitle}>Hata</Text>
          <Text style={styles.errorText}>
            {error || 'Vaka bilgileri bulunamadı'}
          </Text>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color="#007AFF" />
            <Text style={styles.backButtonText}>Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  const { case: caseItem, survey } = caseDetail;
  if (survey) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.completedContainer}>
          <Ionicons name="checkmark-circle" size={64} color="#34C759" />
          <Text style={styles.completedTitle}>Anket Doldurulmuş</Text>
          <Text style={styles.completedText}>
            Bu vaka için zaten anket doldurulmuş.
          </Text>
          <Text style={styles.completedRating}>
            Verilen puan: {survey.rating}/5 yıldız
          </Text>
          {survey.comment && (
            <View style={styles.commentBox}>
              <Text style={styles.commentLabel}>Yorum:</Text>
              <Text style={styles.commentText}>"{survey.comment}"</Text>
            </View>
          )}
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.navigate('CaseDetails', { caseId })}
          >
            <Ionicons name="document-text-outline" size={20} color="#007AFF" />
            <Text style={styles.backButtonText}>Vaka Detayına Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  if (!caseItem.lastState.isTerminal) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.errorContainer}>
          <Ionicons name="time-outline" size={64} color="#FF9500" />
          <Text style={styles.errorTitle}>Henüz Erken</Text>
          <Text style={styles.errorText}>
            Bu vaka henüz tamamlanmamış. Anket sadece tamamlanan vakalar için doldurulabilir.
          </Text>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color="#007AFF" />
            <Text style={styles.backButtonText}>Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Müşteri Memnuniyeti</Text>
          <Text style={styles.headerSubtitle}>
            Vaka #{caseItem.caseId} • {getCaseTypeLabel(caseItem.caseType.code)}
          </Text>
        </View>
        <View style={styles.placeholder} />
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.question}>
          Aldığınız hizmetten ne kadar memnunsunuz?
        </Text>
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((rating) => (
            <TouchableOpacity
              key={rating}
              style={[
                styles.ratingButton,
                selectedRating === rating && {
                  backgroundColor: getRatingColor(rating),
                  borderColor: getRatingColor(rating),
                }
              ]}
              onPress={() => handleRatingSelect(rating)}
              disabled={submitting}
            >
              <Text style={[
                styles.ratingNumber,
                selectedRating === rating && styles.selectedRatingNumber
              ]}>
                {rating}
              </Text>
              <Text style={[
                styles.ratingText,
                selectedRating === rating && styles.selectedRatingText
              ]}>
                {getRatingText(rating)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {selectedRating && (
          <View style={styles.selectedContainer}>
            <Text style={styles.selectedLabel}>Seçilen puan:</Text>
            <Text style={[
              styles.selectedValue,
              { color: getRatingColor(selectedRating) }
            ]}>
              {selectedRating}/5 - {getRatingText(selectedRating)}
            </Text>
          </View>
        )}
        <View style={styles.commentSection}>
          <Text style={styles.commentSectionLabel}>Yorum (İsteğe bağlı):</Text>
          <TextInput
            style={styles.commentInput}
            value={comment}
            onChangeText={setComment}
            placeholder="Hizmet hakkında yorumunuzu yazabilirsiniz..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={!submitting}
          />
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.cancelButton, submitting && styles.buttonDisabled]} 
            onPress={() => navigation.goBack()}
            disabled={submitting}
          >
            <Text style={styles.cancelButtonText}>İptal</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.submitButton,
              selectedRating ? { backgroundColor: getRatingColor(selectedRating) } : {},
              submitting && styles.buttonDisabled
            ]} 
            onPress={handleSubmit}
            disabled={!selectedRating || submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Gönder</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  completedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  completedTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#34C759',
    marginTop: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  completedText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 16,
  },
  completedRating: {
    fontSize: 20,
    fontWeight: '700',
    color: '#34C759',
    marginBottom: 16,
  },
  commentBox: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  commentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 8,
  },
  commentText: {
    fontSize: 16,
    color: '#1C1C1E',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  backButton: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 2,
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  question: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 28,
  },
  ratingContainer: {
    gap: 12,
    marginBottom: 24,
  },
  ratingButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E5E7',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  ratingNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#8E8E93',
    marginRight: 16,
    width: 32,
    textAlign: 'center',
  },
  selectedRatingNumber: {
    color: '#FFFFFF',
  },
  ratingText: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
  selectedRatingText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  selectedContainer: {
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  selectedLabel: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 4,
    fontWeight: '500',
  },
  selectedValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  commentSection: {
    marginBottom: 24,
  },
  commentSectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  commentInput: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E5E7',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1C1C1E',
    minHeight: 100,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
    paddingBottom: 100,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cancelButtonText: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});