import { prisma } from "../config/database";
import AppError from "../utils/AppError";
import logger from "../config/winston";
import {
  CreateAddressInput,
  UpdateAddressInput,
} from "../schema/address.schema";

/**
 * CREATE ADDRESS SERVICE
 */
export const CreateAddressService = async (
  userId: string,
  data: CreateAddressInput,
) => {
  const address = await prisma.address.create({
    data: {
      userId,
      ...data,
    },
  });

  return address;
};

/**
 * GET ALL THE ADDRESS SERVICE
 */

export const GetAllAddressService = async (userId: string) => {
  const address = await prisma.address.findMany({
    where: { userId: userId },
  });

  return address;
};

/**
 * GET ADDRESS BY ID SERVICE
 */

export const GetAddressByIdService = async (
  userId: string,
  addressId: string,
) => {
  const address = await prisma.address.findUnique({
    where: {
      id: addressId,
      userId,
    },
  });

  if (!address) {
    logger.warn(
      `Address with ID: ${addressId} not found for the user : ${userId}`,
    );
    throw new AppError("Address not found", 404);
  }

  return address;
};

/**
 * UPDATE ADDRESS SERVICE
 */

export const UpdateAddressService = async (
  userId: string,
  addressId: string,
  data: UpdateAddressInput,
) => {
  const address = await prisma.address.findUnique({
    where: {
      id: addressId,
      userId: userId,
    },
  });

  if (!address) {
    logger.warn(`Address with ID: ${addressId} not found`);
    throw new AppError("Address not found", 404);
  }

  const updateAddress = await prisma.address.update({
    where: { id: addressId },
    data,
  });

  return updateAddress;
};

/**
 * DETELE ADDRESS SERVICE
 */

export const DeleteAddressService = async (
  userId: string,
  addressId: string,
) => {
  const address = await prisma.address.findFirst({
    where: {
      id: addressId,
      userId,
    },
  });

  if (!address) {
    logger.warn(
      `Delete failed. Address ${addressId} not found for user ${userId}`,
    );
    throw new AppError("Address not found", 404);
  }

  await prisma.address.delete({
    where: { id: addressId },
  });

  logger.info(`Address ${addressId} deleted by user ${userId}`);
};
