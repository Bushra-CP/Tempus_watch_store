const User = require('../../models/userSchema');
const Address = require('../../models/addressSchema');
const logger = require('../../utils/logger');

const findUser = async (userId) => {
  return await Address.findOne({ userId });
};

const makeCurrentUndefault = async (userId) => {
  return await Address.updateOne(
    { userId, 'addresses.isDefault': true },
    { $set: { 'addresses.$.isDefault': false } },
  );
};

const addNewAddress = async (userId, newAddressData) => {
  const newAddress = new Address({
    userId,
    addresses: newAddressData,
  });
  return await newAddress.save();
};

const addAddressToExistingUser = async (userId, newAddressData) => {
  const address = await Address.findOne({ userId });
  const updatedAddresses = [...address.addresses, newAddressData];

  return await Address.updateOne(
    { userId },
    {
      $set: {
        addresses: updatedAddresses,
      },
    },
  );
};

const editAddress = async (userId, addressId, editAddressData) => {
  const editData = {
    'addresses.$.country': editAddressData.country,
    'addresses.$.name': editAddressData.name,
    'addresses.$.phoneNo': editAddressData.phoneNo,
    'addresses.$.pincode': editAddressData.pincode,
    'addresses.$.addressLine': editAddressData.addressLine,
    'addresses.$.landmark': editAddressData.landmark,
    'addresses.$.townCity': editAddressData.townCity,
    'addresses.$.state': editAddressData.state,
    'addresses.$.addressType': editAddressData.addressType,
    'addresses.$.isDefault': editAddressData.isDefault,
  };
  return await Address.findOneAndUpdate(
    { userId, 'addresses._id': addressId },
    { $set: editData },
  );
};

const removeAddress=async (userId,addressId) => {
    return await Address.deleteOne({userId,'addresses._id':addressId});
};

module.exports = {
  findUser,
  makeCurrentUndefault,
  addNewAddress,
  addAddressToExistingUser,
  editAddress,
  removeAddress,
};
