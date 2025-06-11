import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppSelector } from '../../store';
import { subscriptionApi, packageApi, courseApi, lessonApi } from '../../services/api';
import { useNavigation } from '@react-navigation/native';

interface SubscriptionResponse {
    id: string;
    userId: string;
    packageId: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
}

interface PackageResponse {
    id: string;
    title: string;
    description: string;
    price: number;
    imageUrl?: string;
    createdAt: string;
    updatedAt: string;
    courseIds: string[];
}

interface CourseResponse {
    id: string;
    title: string;
    description: string;
    subject: number;
    imageUrl?: string;
    createdAt: string;
    updatedAt: string;
}

interface LessonResponse {
    id: string;
    title: string;
    description: string;
    videoUrl: string;
    order: number;
    transcript?: string;
    imageUrl?: string;
    createdAt: string;
    updatedAt: string;
    courseId: string;
}

const DashboardScreen = () => {
    const navigation = useNavigation();
    const user = useAppSelector((state) => state.auth.user);
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [subscriptions, setSubscriptions] = useState<SubscriptionResponse[]>([]);
    const [packages, setPackages] = useState<PackageResponse[]>([]);
    const [courses, setCourses] = useState<CourseResponse[]>([]);
    const [lessonsMap, setLessonsMap] = useState<Record<string, LessonResponse[]>>({});
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
    const [selectedLesson, setSelectedLesson] = useState<LessonResponse | null>(null);
    const [selectedCourse, setSelectedCourse] = useState<CourseResponse | null>(null);
    const [expandedPackageId, setExpandedPackageId] = useState<string | null>(null);
    const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);

    useEffect(() => {
        if (!user?.id) {
            navigation.navigate('Login');
            return;
        }

        const fetchData = async () => {
            try {
                setError(null);
                console.log('Fetching subscriptions for user:', user.id);
                
                const subRes = await subscriptionApi.getActiveSubscriptions(user.id);
                const subs = subRes.data;
                console.log('Active subscriptions:', subs);
                
                if (!subs || subs.length === 0) {
                    setError('You don\'t have any active subscriptions. Please purchase a package to access lessons.');
                    setLoading(false);
                    return;
                }
                
                setSubscriptions(subs);

                console.log('Fetching package details...');
                const pkgPromises = subs.map(sub => packageApi.getPackage(sub.packageId));
                const pkgResults = await Promise.all(pkgPromises);
                const pkgs = pkgResults.map(res => res.data).filter(Boolean);
                console.log('Packages:', pkgs);
                setPackages(pkgs);

                const courseIds = Array.from(new Set(pkgs.flatMap(p => p.courseIds || [])));
                console.log('Course IDs:', courseIds);
                
                if (courseIds.length === 0) {
                    setError('No courses found in your packages. Please contact support.');
                    setLoading(false);
                    return;
                }

                console.log('Fetching course details...');
                const coursePromises = courseIds.map(cid => courseApi.getCourse(cid));
                const courseResults = await Promise.all(coursePromises);
                const crs = courseResults.map(res => res.data).filter(Boolean);
                console.log('Courses:', crs);
                setCourses(crs);

                if (crs.length > 0) {
                    setSelectedCourseId(crs[0].id);
                }

                console.log('Fetching lessons...');
                const lessonsMapTemp: Record<string, LessonResponse[]> = {};
                await Promise.all(crs.map(async c => {
                    try {
                        const lessonsRes = await lessonApi.getLessons(c.id);
                        const sortedLessons = lessonsRes.data.sort((a, b) => a.order - b.order);
                        lessonsMapTemp[c.id] = sortedLessons;
                        console.log(`Lessons for course ${c.id}:`, sortedLessons);
                    } catch (err) {
                        console.error(`Failed to fetch lessons for course ${c.id}:`, err);
                        lessonsMapTemp[c.id] = [];
                    }
                }));
                setLessonsMap(lessonsMapTemp);
            } catch (err) {
                console.error('Failed to load dashboard data:', err);
                setError('Failed to load your courses and lessons. Please try refreshing the page.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user?.id, navigation]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Loading your courses and lessons...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Icon name="alert-circle" size={48} color={theme.colors.error} />
                <Text style={styles.errorText}>{error}</Text>
                {error.includes('subscriptions') && (
                    <TouchableOpacity
                        style={styles.errorButton}
                        onPress={() => navigation.navigate('Packages')}
                    >
                        <Text style={styles.errorButtonText}>View Available Packages</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    }

    // Filter unique packages by id
    const uniquePackages = packages.filter((pkg, idx, arr) => arr.findIndex(p => p.id === pkg.id) === idx);

    if (courses.length === 0) {
        return (
            <View style={styles.errorContainer}>
                <Icon name="information" size={48} color={theme.colors.primary} />
                <Text style={styles.errorText}>No Courses Available</Text>
                <Text style={styles.errorSubText}>There are no courses available in your packages at the moment.</Text>
            </View>
        );
    }

    const renderPackageItem = ({ item: pkg }: { item: PackageResponse }) => (
        <View style={styles.packageContainer}>
            <TouchableOpacity
                style={styles.packageHeader}
                onPress={() => {
                    setExpandedPackageId(expandedPackageId === pkg.id ? null : pkg.id);
                    setExpandedCourseId(null);
                }}
            >
                <Icon
                    name={expandedPackageId === pkg.id ? 'chevron-down' : 'chevron-right'}
                    size={24}
                    color={theme.colors.primary}
                />
                <Text style={styles.packageTitle}>{pkg.title}</Text>
            </TouchableOpacity>
            
            {expandedPackageId === pkg.id && (
                <View style={styles.coursesContainer}>
                    {pkg.courseIds?.map(courseId => {
                        const course = courses.find(c => c.id === courseId);
                        if (!course) return null;
                        return (
                            <View key={courseId} style={styles.courseContainer}>
                                <TouchableOpacity
                                    style={styles.courseHeader}
                                    onPress={() => setExpandedCourseId(expandedCourseId === courseId ? null : courseId)}
                                >
                                    <Icon
                                        name={expandedCourseId === courseId ? 'chevron-down' : 'chevron-right'}
                                        size={20}
                                        color={theme.colors.primary}
                                    />
                                    <Text style={styles.courseTitle}>{course.title}</Text>
                                </TouchableOpacity>
                                
                                {expandedCourseId === courseId && (
                                    <View style={styles.lessonsContainer}>
                                        {(lessonsMap[courseId] || []).map(lesson => (
                                            <TouchableOpacity
                                                key={lesson.id}
                                                style={[
                                                    styles.lessonItem,
                                                    selectedLesson?.id === lesson.id && styles.selectedLesson
                                                ]}
                                                onPress={() => {
                                                    setSelectedLesson(lesson);
                                                    navigation.navigate('LessonDetails', { lessonId: lesson.id });
                                                }}
                                            >
                                                <Text style={[
                                                    styles.lessonTitle,
                                                    selectedLesson?.id === lesson.id && styles.selectedLessonText
                                                ]}>
                                                    {lesson.title}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Paketlər</Text>
            </View>
            <FlatList
                data={uniquePackages}
                renderItem={renderPackageItem}
                keyExtractor={(item) => `package-${item.id}`}
                contentContainerStyle={styles.listContainer}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafbfc',
    },
    header: {
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#c33764',
    },
    listContainer: {
        padding: 16,
    },
    packageContainer: {
        marginBottom: 16,
    },
    packageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    packageTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
        color: '#222',
    },
    coursesContainer: {
        marginLeft: 16,
        marginTop: 8,
    },
    courseContainer: {
        marginBottom: 12,
    },
    courseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 6,
    },
    courseTitle: {
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 8,
        color: '#444',
    },
    lessonsContainer: {
        marginLeft: 16,
        marginTop: 8,
    },
    lessonItem: {
        padding: 10,
        marginBottom: 6,
        borderRadius: 6,
    },
    selectedLesson: {
        backgroundColor: '#f5e1ef',
    },
    lessonTitle: {
        fontSize: 14,
        color: '#222',
    },
    selectedLessonText: {
        color: '#c33764',
        fontWeight: '700',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        marginTop: 12,
        fontSize: 18,
        fontWeight: '600',
        color: '#c33764',
        textAlign: 'center',
    },
    errorSubText: {
        marginTop: 8,
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    errorButton: {
        marginTop: 20,
        padding: 12,
        backgroundColor: '#c33764',
        borderRadius: 8,
    },
    errorButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default DashboardScreen; 