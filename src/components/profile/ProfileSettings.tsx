import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  Heart, 
  Settings, 
  Bell, 
  Shield, 
  CreditCard,
  LogOut,
  Save
} from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { useAuth } from '@/contexts/AuthContext'
import { useCouple } from '@/hooks/useCouple'

export default function ProfileSettings() {
  const { user, updateProfile, signOut } = useAuth()
  const { couple, linkPartner } = useCouple()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    age: user?.age?.toString() || '',
    gender: user?.gender || '',
    relationshipStatus: user?.relationshipStatus || ''
  })
  const [partnerEmail, setPartnerEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true)
      await updateProfile({
        fullName: formData.fullName,
        age: formData.age ? parseInt(formData.age) : undefined,
        gender: formData.gender,
        relationshipStatus: formData.relationshipStatus
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLinkPartner = async () => {
    try {
      setIsLoading(true)
      await linkPartner(partnerEmail)
      setPartnerEmail('')
    } catch (error) {
      console.error('Error linking partner:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gradient mb-2">Profile Settings</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage your account and relationship preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center">
                <User className="w-5 h-5 mr-2" />
                Personal Information
              </h2>
              <Button
                variant="ghost"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    className="input-field"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-gray-100">{user?.fullName || 'Not set'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <p className="text-gray-900 dark:text-gray-100 flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  {user?.email}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Age
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                      className="input-field"
                      min="18"
                      max="100"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-gray-100">{user?.age || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Gender
                  </label>
                  {isEditing ? (
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                      className="input-field"
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non-binary">Non-binary</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 dark:text-gray-100 capitalize">
                      {user?.gender?.replace('-', ' ') || 'Not set'}
                    </p>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={handleSaveProfile}
                    isLoading={isLoading}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Partner Linking */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold flex items-center mb-6">
              <Heart className="w-5 h-5 mr-2" />
              Relationship Status
            </h2>

            {couple ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                  <div>
                    <h3 className="font-semibold text-green-800 dark:text-green-200">
                      Partner Linked
                    </h3>
                    <p className="text-green-700 dark:text-green-300 text-sm">
                      You're connected and ready for couples therapy!
                    </p>
                  </div>
                  <Badge variant="success">Connected</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">Relationship started:</span>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {couple.relationshipStartDate 
                        ? new Date(couple.relationshipStartDate).toLocaleDateString()
                        : 'Not set'
                      }
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">Current streak:</span>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {couple.currentStreak} days
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                    Link Your Partner
                  </h3>
                  <p className="text-yellow-700 dark:text-yellow-300 text-sm mb-4">
                    Enter your partner's email to start your couples therapy journey together.
                  </p>
                  
                  <div className="flex space-x-3">
                    <input
                      type="email"
                      value={partnerEmail}
                      onChange={(e) => setPartnerEmail(e.target.value)}
                      placeholder="Partner's email address"
                      className="flex-1 input-field"
                    />
                    <Button
                      onClick={handleLinkPartner}
                      isLoading={isLoading}
                      disabled={!partnerEmail}
                    >
                      Link Partner
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Subscription */}
          <Card className="p-6">
            <h3 className="font-semibold flex items-center mb-4">
              <CreditCard className="w-5 h-5 mr-2" />
              Subscription
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">Current Plan:</span>
                <Badge variant="primary">
                  {user?.subscriptionTier || 'Free'}
                </Badge>
              </div>
              
              <Button variant="secondary" className="w-full">
                Manage Subscription
              </Button>
            </div>
          </Card>

          {/* Quick Settings */}
          <Card className="p-6">
            <h3 className="font-semibold flex items-center mb-4">
              <Settings className="w-5 h-5 mr-2" />
              Quick Settings
            </h3>
            
            <div className="space-y-3">
              <Button variant="ghost" className="w-full justify-start">
                <Bell className="w-4 h-4 mr-3" />
                Notifications
              </Button>
              
              <Button variant="ghost" className="w-full justify-start">
                <Shield className="w-4 h-4 mr-3" />
                Privacy & Security
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full justify-start text-red-600 hover:text-red-700"
                onClick={signOut}
              >
                <LogOut className="w-4 h-4 mr-3" />
                Sign Out
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}