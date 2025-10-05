import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Phone, MapPin, Building, Calendar, Edit, Save, X } from 'lucide-react';
import type { Tables } from '@/types/supabase';

type UserProfile = Tables<'profiles'>;

const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@email.com',
    phone: '(555) 123-4567',
    address: {
      street: '123 Main Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105'
    },
    employment: {
      company: 'Tech Solutions Inc.',
      position: 'Software Engineer',
      startDate: '2020-03-15',
      annualIncome: '$95,000'
    },
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
    role: 'Homebuyer',
    joinDate: '2024-01-01'
  });

  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile(profile);
  };

  const handleSave = () => {
    setProfile(editedProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setEditedProfile(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof UserProfile] as any,
          [child]: value
        }
      }));
    } else {
      setEditedProfile(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const currentProfile = isEditing ? editedProfile : profile;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
          <p className="text-gray-600">Manage your personal information and preferences</p>
        </div>

        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={currentProfile.avatar ?? undefined} />
                  <AvatarFallback className="text-lg">
                    {currentProfile.firstName[0]}{currentProfile.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {currentProfile.firstName} {currentProfile.lastName}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">{currentProfile.role}</Badge>
                    <span className="text-sm text-gray-500">
                      Member since {new Date(currentProfile.joinDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                {!isEditing ? (
                  <Button onClick={handleEdit} className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={handleCancel} className="flex items-center gap-2">
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                    <Button onClick={handleSave} className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Save Changes
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  {isEditing ? (
                    <Input
                      id="firstName"
                      value={editedProfile.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{currentProfile.firstName}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  {isEditing ? (
                    <Input
                      id="lastName"
                      value={editedProfile.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{currentProfile.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={editedProfile.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                ) : (
                  <p className="mt-1 text-sm text-gray-900">{currentProfile.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone
                </Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={editedProfile.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                ) : (
                  <p className="mt-1 text-sm text-gray-900">{currentProfile.phone}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="street">Street Address</Label>
                {isEditing ? (
                  <Input
                    id="street"
                    value={editedProfile.address.street}
                    onChange={(e) => handleInputChange('address.street', e.target.value)}
                  />
                ) : (
                  <p className="mt-1 text-sm text-gray-900">{currentProfile.address.street}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  {isEditing ? (
                    <Input
                      id="city"
                      value={editedProfile.address.city}
                      onChange={(e) => handleInputChange('address.city', e.target.value)}
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{currentProfile.address.city}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  {isEditing ? (
                    <Input
                      id="state"
                      value={editedProfile.address.state}
                      onChange={(e) => handleInputChange('address.state', e.target.value)}
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{currentProfile.address.state}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="zipCode">ZIP Code</Label>
                {isEditing ? (
                  <Input
                    id="zipCode"
                    value={editedProfile.address.zipCode}
                    onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                  />
                ) : (
                  <p className="mt-1 text-sm text-gray-900">{currentProfile.address.zipCode}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Employment Information */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Employment Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="company">Company</Label>
                    {isEditing ? (
                      <Input
                        id="company"
                        value={editedProfile.employment.company}
                        onChange={(e) => handleInputChange('employment.company', e.target.value)}
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{currentProfile.employment.company}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="position">Position</Label>
                    {isEditing ? (
                      <Input
                        id="position"
                        value={editedProfile.employment.position}
                        onChange={(e) => handleInputChange('employment.position', e.target.value)}
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{currentProfile.employment.position}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="startDate" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Start Date
                    </Label>
                    {isEditing ? (
                      <Input
                        id="startDate"
                        type="date"
                        value={editedProfile.employment.startDate}
                        onChange={(e) => handleInputChange('employment.startDate', e.target.value)}
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(currentProfile.employment.startDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="annualIncome">Annual Income</Label>
                    {isEditing ? (
                      <Input
                        id="annualIncome"
                        value={editedProfile.employment.annualIncome}
                        onChange={(e) => handleInputChange('employment.annualIncome', e.target.value)}
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{currentProfile.employment.annualIncome}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;