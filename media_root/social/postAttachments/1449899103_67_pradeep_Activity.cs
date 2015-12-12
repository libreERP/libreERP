using System;
using System.Globalization;

using Core.Data;
using Core.Data.DataServices;
using Ent.Framework.Core;
using Core.Container;
using Core.Extensions;
using Ent.Repository.Contracts;
using Ent.Repository.Contracts.LMS;
using Ent.ResponseModel;
using Ent.ResponseModel.Activity;
using Ent.ResponseModel.Learner.Search;
using Core.Resource;
using Ent.ResponseModel.Social;
using Ent.SupplementalData;
using Ent.ResponseModel.Training;
using System.Collections.Generic;
using Ent.Framework.Core.Constants;
using Ent.ResponseModel.Resources;
using Ent.ResponseModel.Skills;

namespace Ent.Repository.Core.LMS
{
    [ExportService(typeof(IActivity), ExportLifeTime.Prototype, "dataConnection")]
    public class Activity : RepositoryBase, IActivity
    {
        private ContentTypeService ContentTypeHelper = null;

        public Activity(IDataConnection connection)
            : base(connection)
        { }

        public GenericResponseItem GetActivitySearchInfo(int EmpId, int ViewEmpId, int ActivityId, int RootActId, int Mode, int UserMode, int requiredDetails)
        {
            Logger.TraceFunctionEntry("GetActivitySearchInfo", EmpId, ViewEmpId, ActivityId, RootActId, Mode, UserMode, requiredDetails);
            GenericResponseItem retVal = null;
            try
            {
                IStoredProcedure sp = DataConnection.CreateStoredProcedure("LMS_Activity.GetActivitySearchInfo");
                sp.AddIntParameter("@i_EmpId", EmpId);
                sp.AddIntParameter("@i_ViewEmpId", ViewEmpId);
                sp.AddIntParameter("@i_ActivityId", ActivityId);
                sp.AddIntParameter("@i_RootActId", RootActId);
                sp.AddIntParameter("@i_Mode", Mode);
                sp.AddIntParameter("@i_UserMode", UserMode);
                sp.AddIntParameter("@i_RequiredDetails", requiredDetails);
                sp.AddReturnCursor("rs_ActRegStatus");
                sp.AddReturnCursor("rs_ActionButton");
                sp.AddReturnCursor("recTrackCapacity");
                sp.AddReturnCursor("recActCost");
                sp.AddReturnCursor("recCommunityInfo");
                sp.AddReturnCursor("recActRating");

                using (RecordSetReader rsr = sp.ExecuteReader())
                {
                    retVal = new GenericResponseItem();
                    while (rsr.Read())
                    {
                        retVal.Set("RegistrationStatus", rsr["RegistrationStatus"].ToString());
                        retVal.Set("OtherRegistrationsStatus", rsr["OtherRegistrationsStatus"].ToString());
                    }

                    rsr.NextResult();
                    while (rsr.Read())
                    {
                        retVal.Set("OpenForReg", (rsr.GetFieldValue<int>("OpenForReg", 0)).ToString());
                        retVal.Set("OwnerEmpFK", (rsr.GetFieldValue<int>("OwnerEmpFK", 0)).ToString());
                        retVal.Set("ReferenceActId", rsr["ReferenceActId"].ToString());
                        retVal.Set("ActType", rsr["ActType"].ToString());
                        retVal.Set("AlreadyRegistered", rsr["AlreadyRegistered"].ToString());
                        retVal.Set("OBLRootHidden", rsr["OBLRootHidden"].ToString());
                        retVal.Set("RootOBLSourceFK", rsr.GetFieldValue<int>("RootOBLSourceFK", 0).ToString());
                        retVal.Set("Reg_PK", rsr.GetFieldValue<int>("Reg_PK", 0).ToString());
                        retVal.Set("Attempt_PK", rsr.GetFieldValue<int>("Attempt_PK", 0).ToString());
                        DateTime? lacEndDate = rsr.GetFieldValue<DateTime?>("LACEndDt", null);
                        retVal.Set("LACEndDt", (lacEndDate.HasValue ? lacEndDate.Value.ToString("yyyy/MM/dd HH:mm", CultureInfo.InvariantCulture) : String.Empty));
                        retVal.Set("RootActStatus", rsr["RootActStatus"].ToString());
                        retVal.Set("OfferedByTypeFk", rsr.GetFieldValue<int>("OfferedByTypeFk", 0).ToString());
                        retVal.Set("ActAssignSettings", rsr.GetInt32(rsr.GetOrdinal("ActAssignSettings")).ToString());
                        retVal.Set("ActAssignSettingsInhtd", rsr.GetInt32(rsr.GetOrdinal("ActAssignSettingsInhtd")).ToString());
                    }
                    rsr.NextResult();
                    while (rsr.Read())
                    {
                        retVal.Set("AvailableSeats", rsr.GetFieldValue<System.Int64>("AvailableSeats", 0).ToString());
                    }
                    rsr.NextResult();
                    while (rsr.Read())
                    {
                        retVal.Set("BaseCost", rsr.GetFieldValue<float>("CostBase", 0F).ToString());
                        retVal.Set("CurrencyId", rsr.GetFieldValue<int>("currencyId", 0).ToString());
                    }
                    rsr.NextResult();
                    while (rsr.Read())
                    {
                        retVal.Set("CommunityId", rsr.GetFieldValue<int>("CommunityId", 0).ToString());
                        retVal.Set("CommunityEnabled", rsr.GetFieldValue<int>("CommunityEnabled", 0).ToString());
                        retVal.Set("AttemptStatus", rsr.GetFieldValue<int>("AttemptStatus", 0).ToString());
                        retVal.Set("ActInst", rsr.GetFieldValue<int>("ActInst", 0).ToString());
                    }
                    rsr.NextResult();
                    while (rsr.Read())
                    {
                        retVal.Set("UserRating", rsr.GetFieldValue<int>("UserRating", 0).ToString());
                        retVal.Set("RatingCount", rsr.GetFieldValue<int>("RatingCount", 0).ToString());
                        retVal.Set("CommentsCount", rsr.GetFieldValue<int>("CommentsCount", 0).ToString());
                        retVal.Set("IsCommentAllowed", rsr.GetFieldValue<int>("IsCommentAllowed", 0).ToString());
                        retVal.Set("ShowComments", rsr.GetFieldValue<int>("ShowComments", 0).ToString());
                        retVal.Set("AnonymousUser", rsr.GetFieldValue<int>("AnonymousUser", 0).ToString());
                        retVal.Set("IsRatingEnabled", rsr.GetFieldValue<int>("IsRatingEnabled", 0).ToString());
                    }
                }
            }
            catch (Exception e)
            {
                Logger.Error("Error in GetActivityRegStatus : ", e);
                throw new ApplicationException("Error in GetActivityRegStatus : ", e);
            }

            Logger.TraceFunctionExit("GetActivityRegStatus");
            return retVal;
        }

        public ResponseModel.Training.UserTrainingItem GetActivityGenDetails(int empId, int viewableEmployeeId, int actId, int rootActId, int callerId, int userMode, string langCode, int UserLangId)
        {
            ResponseModel.Training.UserTrainingItem userTrainingItem = new UserTrainingItem();
            ResponseModel.Activity.Activity act = null;

            Logger.TraceFunctionEntry("Activity.GetActivityGenDetails", empId, viewableEmployeeId, actId, rootActId, callerId, userMode, langCode, UserLangId);

            try
            {
                IStoredProcedure sp = DataConnection.CreateStoredProcedure("LMS_Activity.GetActivityGenDetails");
                sp.AddIntParameter("@i_EmpId", empId);
                sp.AddIntParameter("@i_ViewEmpId", viewableEmployeeId);
                sp.AddIntParameter("@i_ActivityId", actId);
                sp.AddIntParameter("@i_RootActId", rootActId);
                sp.AddIntParameter("@i_CallerId", callerId);
                sp.AddIntParameter("@i_UserMode", userMode);
                sp.AddCharParameter("@vc_LangCode", langCode);

                sp.AddReturnCursor("rs_ActNotes");
                sp.AddReturnCursor("rs_ActSchdDet");
                sp.AddReturnCursor("rs_ActFacilities");
                sp.AddReturnCursor("rs_ActInstructors");
                sp.AddReturnCursor("rs_ActGenDet");
                sp.AddReturnCursor("rs_ActAddInfo");

                sp.AddReturnCursor("rs_FulfilmentsSource");
                sp.AddReturnCursor("rs_FulfilmentsTarget");
                sp.AddReturnCursor("maxRec");
                sp.AddReturnCursor("nodeRec");
                sp.AddReturnCursor("rs_ActReq");
                sp.AddReturnCursor("rs_ActSkills");
                sp.AddReturnCursor("rs_ActCertifications");
                sp.AddReturnCursor("rs_ActPreq");
                sp.AddReturnCursor("rs_TRActConfg");
                sp.AddReturnCursor("recTrackCapacity");


                using (RecordSetReader reader = sp.ExecuteReader())
                {

                    #region Activities
                    act = new ResponseModel.Activity.Activity();
                    act.Id = actId;
                    if (reader.Read())
                    {
                        act.Description = reader.GetFieldValue<String>("ActivityDesc", String.Empty);
                    }

                    reader.NextResult();

                    if (reader.Read())
                    {
                        act.Schedule = new ActivitySchedule()
                        {
                            StartDateUTC = reader.GetFieldValue<DateTime?>("StartDt", null),
                            EffectiveDateUTC = reader.GetFieldValue<DateTime?>("EffectiveDt", null),
                            EndDateUTC = reader.GetFieldValue<DateTime?>("EndDt", null),
                            ActivityTimeZone = reader.GetFieldValue<int>(("ActTZ"), 0)
                        };
                        act.CBTLaunchMtdFK = reader.GetFieldValue<int>("LaunchMtdFK", 0);
                        act.TimeZoneFK = reader.GetFieldValue<int>(("ActTZ"), 0);
                    }
                    reader.NextResult();
                    List<Location> locations = new List<Location>();

                    if (reader.Read())
                    {
                        act.FacilityCity = reader.GetFieldValue<String>("FacCity", String.Empty);
                        Location location = new Location();
                        location.Name = reader.GetFieldValue<String>("Loc_Name", String.Empty);
                        locations.Add(location);
                    }

                    act.Locations = locations;
                    reader.NextResult();
                    List<ResponseModel.User.User> userInstructors = new List<ResponseModel.User.User>();
                    while (reader.Read())
                    {
                        ResponseModel.User.User instructor = new ResponseModel.User.User();
                        instructor.EmpFName = reader.GetFieldValue<String>("Inst_FName", String.Empty);
                        instructor.EmpLName = reader.GetFieldValue<String>("Inst_LName", String.Empty);
                        instructor.EmpMI = reader.GetFieldValue<String>("Inst_MI", String.Empty);
                        userInstructors.Add(instructor);
                    }
                    act.Instructor = userInstructors;
                    reader.NextResult();

                    if (reader.Read())
                    {
                        act.Name = reader.GetString(reader.GetOrdinal("ActivityName"));
                        act.Code = reader.GetFieldValue<String>("Code", String.Empty);
                        act.ActivityLabel = new ActivityLabel()
                        {
                            Id = reader.GetInt32(reader.GetOrdinal("ActLabelFK")),
                            Name = reader.GetString(reader.GetOrdinal("ActLabelName"))
                        };
                        act.ImagePath = reader.GetFieldValue<String>("ImagePath", String.Empty);
                        act.RootActivityId = reader.GetFieldValue<int>("RootActID", 0);
                        act.IsRatingEnabled = reader.GetBoolean(reader.GetOrdinal("IsRatingEnabled"));
                        act.ActivityRating = new Rating()
                        {
                            AllowAnonymousUser = reader.GetBoolean(reader.GetOrdinal("AnonymousUser")),
                            AverageRating = reader.GetDouble(reader.GetOrdinal("AvgRating")),
                            CommentsCount = reader.GetInt32(reader.GetOrdinal("CommentsCount")),
                            IsCommentsAllowed = reader.GetBoolean(reader.GetOrdinal("IsCommentAllowed")),
                            RatingCount = reader.GetInt32(reader.GetOrdinal("RatingCount")),
                            ShowComments = reader.GetBoolean(reader.GetOrdinal("ShowComments"))
                        };
                        UserAttempt userAttempt = new UserAttempt();
                        userAttempt.AttendStatusId = reader.GetFieldValue<int?>("AttemptStatus", null);
                        userTrainingItem.Attempt = userAttempt;
                        userTrainingItem.IsInstructor = Convert.ToBoolean(reader.GetFieldValue<int>("ActInst", 0));
                        Community community = new Community()
                        {
                            EnabledFeatures = reader.GetFieldValue<int>("CommunityEnabled", 0),
                            CommunityPK = reader.GetFieldValue<int>("CommunityId", 0)
                        };
                        act.Community = community;

                    }
                    reader.NextResult();

                    if (reader.Read())
                    {
                        act.IconFK = reader.GetFieldValue<int>("IconFK", 0);
                        act.CBTPath = reader.GetFieldValue<String>("CBTPath", String.Empty);
                        act.TaxConTypeID = reader.GetFieldValue<int>("TaxConTypeId", 0);
                        act.Language = reader.GetFieldValue<String>("LanguageName", String.Empty);
                        act.TrainingOrganization = reader.GetFieldValue<String>("TrainingOrg", String.Empty);

                    }
                    //act.HasChildren = reader.GetBoolean(reader.GetOrdinal("HasChildren"));
                    //act.ImageId = reader.GetFieldValue<int>("ImageId", 0);
                    //act.ImagePath = reader.GetFieldValue<String>("ImagePath", String.Empty);

                    reader.NextResult();
                    reader.NextResult();
                    reader.NextResult();
                    reader.NextResult();
                    reader.NextResult();
                    reader.NextResult();
                    reader.NextResult();
                    reader.NextResult();
                    reader.NextResult();
                    reader.NextResult();
                    reader.NextResult();

                    if (reader.Read())
                    {
                        act.AvailableSeats = reader.GetFieldValue<int>("AvailableSeats", 0);

                        //ToDo: Use ResourceUtility to render the string on UI L-LMS_Search.Info_SeatsRemaining
                        if (act.AvailableSeats.ToString() != "999999999")
                            act.UnlimitedCapacity = false;
                        else
                            act.UnlimitedCapacity = true;

                        //if (ContentTypeHelper == null)
                        //    ContentTypeHelper = new ContentTypeService(DataConnection, UserLangId);

                        ////ToDo: Content Caching related ?
                        //act.ContentTypeInfo = ContentTypeHelper.GetItemTypeInfo(act.TaxConTypeID, act.IconFK, act.CBTLaunchMtdFK, act.CBTPath);                        
                    }
                    userTrainingItem.TrainingActivity = act;
                    #endregion
                }
            }
            catch (Exception e)
            {
                Logger.Error("Unhandled Exception in Activity.GetActivityGenDetails : ", e);
                throw new ApplicationException("Error in Activity.GetActivityGenDetails", e);
            }

            Logger.TraceFunctionExit("Activity.GetActivityGenDetails");


            return userTrainingItem;
        }
        public int UpdateVerActivityStatus_MP(int ActID)
        {
            Logger.TraceFunctionEntry("Activity.UpdateVerActivityStatus_MP");

            int returnVal = 0;
            try
            {
                IStoredProcedure sp = DataConnection.CreateStoredProcedure("LMS_Activity.UpdateVerActivityStatus_MP");
                sp.AddIntParameter("@i_ActivityId", ActID);
                sp.AddReturnCursor("actRec");
                using (RecordSetReader reader = sp.ExecuteReader())
                {
                    returnVal = 0;
                }

               
            }
            catch (Exception e)
            {
                Logger.TraceFunctionExit("LMS_Activity.UpdateVerActivityStatus_MP");
                Logger.Trace("Error : " + e.Message);
                throw e;
            }
            finally
            {
                Logger.TraceFunctionExit("LMS_Activity.UpdateVerActivityStatus_MP");
            }
            return returnVal;
        }

        public GenericResponseList<UserTrainingItem> GetUserTrainings(string vcUserID, int empId, int viewEmpId, int filterMode, int sortOrder, int sortDirection, int startPos, int maxRecords, int filterId, string searchFilter, int retUsrName, int usrMode, int insrtToTmpTbl, int sessionId, string launchMethods, int viewMode)
        {
            Logger.TraceFunctionEntry("LMS_Activity.GetUserTrainings", vcUserID, empId, viewEmpId, filterMode, sortOrder, sortDirection, startPos, maxRecords, filterId, searchFilter, retUsrName, usrMode, insrtToTmpTbl, sessionId, launchMethods);
            GenericResponseList<UserTrainingItem> retTrainingItems = new GenericResponseList<UserTrainingItem>(); ;
            try
            {
                IStoredProcedure sp = DataConnection.CreateStoredProcedure("LMS_Activity.GetUserTrainings");
                sp.AddCharParameter("@vc_UserId", vcUserID);
                sp.AddIntParameter("@i_EmpId", empId);
                sp.AddIntParameter("@i_ViewEmpId", viewEmpId);
                sp.AddIntParameter("@i_FilterMode", filterMode);
                sp.AddIntParameter("@i_SortOrder", sortOrder);
                sp.AddIntParameter("@i_SortDirection", sortDirection);
                sp.AddIntParameter("@i_StartPos", startPos);
                sp.AddIntParameter("@i_MaxRecords", maxRecords);
                sp.AddIntParameter("@i_FilterId", filterId);
                sp.AddCharParameter("@vc_SearchFilter", searchFilter);
                sp.AddIntParameter("@i_ReturnUserName", retUsrName);
                sp.AddIntParameter("@i_UserMode", usrMode);
                sp.AddIntParameter("@i_insertToTmpTbl", insrtToTmpTbl);
                sp.AddIntParameter("@i_SessionId", sessionId);
                sp.AddCharParameter("@vc_LaunchMethods", launchMethods);
                sp.AddReturnCursor("entityName");
                sp.AddReturnCursor("UserRec");
                sp.AddReturnCursor("MaxRec");
                sp.AddReturnCursor("pageRec");
                using (RecordSetReader rsr = sp.ExecuteReader())
                {
                    retTrainingItems.Results = new List<UserTrainingItem>();

                    rsr.NextResult();
                    rsr.NextResult();

                    while (rsr.Read())
                    {
                        retTrainingItems.MaxCount = int.Parse(rsr[0].ToString());
                    }

                    rsr.NextResult();
                    while (rsr.Read())
                    {
                        var userTrainingItem = new UserTrainingItem();
                        userTrainingItem.TrainingActivity = new ResponseModel.Activity.Activity()
                        {
                            Id = rsr.GetInt32(rsr.GetOrdinal("TrainingID")),
                            Name = rsr.GetString(rsr.GetOrdinal("TrainingName")),
                            Code = rsr.GetFieldValue<String>("ActivityCode", String.Empty),
                            IsRequired = (rsr.GetInt32(rsr.GetOrdinal("RequiredInd")) == 1),
                            ParentActivityName = rsr.GetFieldValue<String>("PrntActivityName", String.Empty),
                            GroupActivityId = rsr.GetFieldValue<int?>("GroupActivityID", 0),
                            CBTPath = rsr.GetFieldValue("TrainingCBTPath", String.Empty),
                            CBTLaunchMtdFK = rsr.GetFieldValue("TrainingLaunchMtdFK", 0),
                            IconFK = rsr.GetFieldValue<int>("TrainingLEMtdId", 0),
                            IsActive = (rsr.GetInt32(rsr.GetOrdinal("TrainingActiveInd")) == 1),
                            IsLaunchable = (rsr.GetFieldValue("MayLaunch", 0) == 1),
                            TimeZoneFK = rsr.GetFieldValue<int>("TimeZoneFK", 0),
                            IsCertification = rsr.GetFieldValue("IsCertification", 0),
                            LaunchEndDate = rsr.GetFieldValue<DateTime?>("LACEndDt", null),
                            ImageId = rsr.GetFieldValue("ImageID", 0),
                            ImagePath = rsr.GetFieldValue("ImagePath", string.Empty),
                            ActivityLabel = new ActivityLabel()
                            {
                                Id = rsr.GetFieldValue<int>("ActivityLabelFK", 0),
                                Name = rsr.GetString(rsr.GetOrdinal("ActivityType"))
                            },
                            Schedule = new ActivitySchedule()
                            {
                                ActivityTimeZone = rsr.GetFieldValue<int>("TimeZoneFK", 0),
                                EffectiveDateUTC = rsr.GetFieldValue<DateTime?>("EffectiveDate", null)
                            }
                        };
                        userTrainingItem.AssignmentInformation = new AssignmentInfo()
                        {
                            IsAssigned = true,
                            IsRequired = (rsr.GetInt32(rsr.GetOrdinal("RequiredInd")) == 1),
                            TrainingPriority = rsr.GetString(rsr.GetOrdinal("PriorityName")),
                            TrainingPriorityId = rsr.GetFieldValue<int>("TrainingPriority", 0),
                            AssignmentSchedule = new AssignmentSchedule()
                            {
                                DueDateUTC = rsr.GetFieldValue<DateTime?>("ExactDueDate", null),
                                PlanDateUTC = rsr.GetFieldValue<DateTime?>("PlanDate", null)
                            },
                            CertificationDetails = new CertificationInfo()
                            {
                                Status = rsr.GetFieldValue("ReqStatus", 0),
                            }
                        };
                        userTrainingItem.AssignmentInformation.CertificationDetails.Schedule.ExpiryDateUTC =
                            rsr.GetFieldValue<DateTime?>("ExpiryDate", null);
                        userTrainingItem.AssignmentInformation.CertificationDetails.Schedule.SuccessfulCompletionDateUTC =
                            rsr.GetFieldValue<DateTime?>("EmpSuccessCompDT", null);
                        userTrainingItem.Attempt = new UserAttempt()
                        {
                            AttemptId = rsr.GetFieldValue("AttemptId", 0),
                            RegistrationId = rsr.GetFieldValue<int?>("RegId", null)
                        };
                        userTrainingItem.Registration = new UserRegistration()
                        {
                            RegistrationId = rsr.GetFieldValue<int>("RegId", 0)
                        };

                        if (viewMode == UserTrainingConstants.AssignedTrainingView)
                        {
                            userTrainingItem.TrainingActivity.VersionActivity = new VersionInfo()
                            {
                                LaunchVersionId = rsr.GetFieldValue<int>("LaunchVersionID", 0),
                                CBTLaunchMethodId = rsr.GetFieldValue<int>("VerCBTLaunchMtdFK", 0)
                            };
                        }
                        else if (viewMode == UserTrainingConstants.RequiredCertificationsView)
                        {
                            userTrainingItem.Registration.IsRegistered = (rsr.GetFieldValue("RegisteredInd", 0) == 1);
                        }

                        retTrainingItems.Results.Add(userTrainingItem);
                    }
                }
            }
            catch (Exception e)
            {
                Logger.Error("Error in LMS_Activity.GetUserTrainings : ", e);
                throw new ApplicationException("Error in LMS_Activity.GetUserTrainings : ", e);
            }

            Logger.TraceFunctionExit("LMS_Activity.GetUserTrainings");
            return retTrainingItems;
        }

        public List<ResponseModel.Activity.Activity> GetActLocDetails(int actId)
        {
            List<ResponseModel.Activity.Activity> actList = null;

            Logger.TraceFunctionEntry("Activity.GetActLocDetails", actId);

            try
            {
                IStoredProcedure sp = DataConnection.CreateStoredProcedure("LMS_Activity.GetActLocDetails");
                sp.AddIntParameter("@i_ActivityId", actId);
                sp.AddReturnCursor("rec_activityname");

                using (RecordSetReader reader = sp.ExecuteReader())
                {
                    #region Activities
                    actList = new List<ResponseModel.Activity.Activity>();                    
                    while(reader.Read())
                    {
                        ResponseModel.Activity.Activity act = new ResponseModel.Activity.Activity();
                        act.Name = reader.GetFieldValue<string>("ActivityName", string.Empty);
                        act.Code = reader.GetFieldValue<string>("Code", string.Empty);
                        act.Id = actId;
                        act.Description = reader.GetFieldValue<String>("ActivityDesc", String.Empty);
                        act.Schedule = new ActivitySchedule()
                        {
                            ActivityTimeZone = reader.GetFieldValue<int>("TimezoneFK", 0),
                            StartDateUTC = reader.GetFieldValue<DateTime?>("StartDt", null),
                            EndDateUTC = reader.GetFieldValue<DateTime?>("EndDt", null),
                        };
                        act.ImagePath = reader.GetFieldValue<string>("MediaPath", null);
                        act.CBTLaunchMtdFK = reader.GetFieldValue<int>("CBTLaunchMtdFK", 0);
                        act.IconFK = reader.GetFieldValue<int>("LEMtdFK", 0);
                        act.CBTPath = reader.GetFieldValue<string>("CBTPath", string.Empty);
                        Location location = new Location()
                        {
                            Name = reader.GetFieldValue<string>("Loc_Name", string.Empty),
                            Facility = new Facility()
                            {
                                Name = reader.GetFieldValue<string>("Fac_Name", string.Empty),
                                State = reader.GetFieldValue<string>("Fac_State", string.Empty),
                                City = reader.GetFieldValue<string>("Fac_City", string.Empty),
                                Country = reader.GetFieldValue<string>("Fac_Cntry", string.Empty)
                            }
                        };
                        List<Location> locList = new List<Location>();
                        locList.Add(location);
                        act.Locations = locList;
                        actList.Add(act);
                    }
                    #endregion
                }
            }
            catch (Exception e)
            {
                Logger.Error("Unhandled Exception in Activity.GetActivityGenDetails : ", e);
                throw new ApplicationException("Error in Activity.GetActivityGenDetails", e);
            }

            Logger.TraceFunctionExit("Activity.GetActLocDetails");

            return actList;
        }

        public bool GetActivityStatus(int actId)
        {
            Logger.TraceFunctionEntry("Activity.GetActLocDetails", actId);
            bool actStatus = false;
            try
            {
                IStoredProcedure sp = DataConnection.CreateStoredProcedure("LMS_Activity.GetActivityStatus");
                sp.AddIntParameter("@i_ActivityId", actId);
                sp.AddReturnCursor("rec_activityname");
                using (RecordSetReader reader = sp.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        actStatus = reader.GetBoolean(reader.GetOrdinal("Active"));
                    }
                }
            }
            catch (Exception e)
            {
                Logger.Error("Unhandled Exception in Activity.GetActivityGenDetails : ", e);
                throw new ApplicationException("Error in Activity.GetActivityGenDetails", e);
            }

            Logger.TraceFunctionExit("Activity.GetActLocDetails");

            return actStatus;
        }

        public IList<Location> GetActLocDetailsOnly(int actId)
        {
            Logger.TraceFunctionEntry("Activity.GetActLocDetailsOnly", actId);
            List<Location> locList = new List<Location>();

            try
            {
                IStoredProcedure sp = DataConnection.CreateStoredProcedure("LMS_Activity.GetActLocDetailsOnly");
                sp.AddIntParameter("@i_ActivityId", actId);
                sp.AddReturnCursor("rec_actlocdetails");

                using (RecordSetReader reader = sp.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        Location location = new Location()
                        {
                            Id = reader.GetFieldValue<int>("Loc_PK", 0),
                            Name = reader.GetFieldValue<string>("Loc_Name", string.Empty) + " (" + reader.GetFieldValue<string>("Fac_Name", string.Empty) + ") "
                        };
                        locList.Add(location);
                    }
                }
            }
            catch (Exception e)
            {
                Logger.Error("Unhandled Exception in Activity.GetActLocDetailsOnly : ", e);
                throw new ApplicationException("Error in Activity.GetActLocDetailsOnly", e);
            }

            Logger.TraceFunctionExit("Activity.GetActLocDetailsOnly");

            return locList;
        }

        public Ent.ResponseModel.Activity.Activity GetActivityCreditDetails(int empId, int actId, Ent.ResponseModel.Activity.Activity act)
        {
            Logger.TraceFunctionEntry("GetActivityCreditDetails", act.Id, act.Name);
            try
            {
                IStoredProcedure sp = DataConnection.CreateStoredProcedure("LMS_Activity.GetActivityCreditDetails");
                sp.AddIntParameter("@i_EmpId", empId);
                sp.AddIntParameter("@i_ActivityId", actId);
                sp.AddReturnCursor("recTraingCrRec");

                act.ActivityCECTargetList = new GenericResponseList<CECTargetList>();
                using (RecordSetReader rsr = sp.ExecuteReader())
                {
                    while (rsr.Read())
                    {
                        
                        CECTargetList ActivityCECTargetList1 = new CECTargetList()
                        {
                          
                            CERGName = rsr.GetFieldValue("CEName", string.Empty),

                            CECredits = rsr.GetFieldValue("ReqdCredits", string.Empty)
                            
                          
                        };
                        
                        act.ActivityCECTargetList.Results.Add(ActivityCECTargetList1);
                        if(rsr.FieldCount>=5)
                        {
                           
                            act.NasbaCreditHours=rsr.GetValue(4).ToString();
                        }
                        if (rsr.FieldCount >= 6)
                        {

                            act.PMICreditHours = rsr.GetValue(5).ToString();
                        }
                    }
                }
            }
            catch (Exception e)
            {
                Logger.Error("Unhandled Error in LMS_Activity.GetActivityCreditDetails : ", e);
                throw e;
            }
            finally
            {
                Logger.TraceFunctionExit("GetActivityCreditDetails");
            }
            return act;
        }
        

        /// <summary>
        /// Function to get activity summary details
        /// </summary>
        /// <param name="empId">Employee Id</param>
        /// <param name="viewableEmployeeId">Viewable Employee Id</param>
        /// <param name="actId">Activity Id</param>
        /// <param name="rootActId">Root activity id</param>
        /// <param name="callerId"></param>
        /// <param name="UserMode">Logged in user mode</param>
        /// <param name="langCode">Language Code</param>
        /// <param name="shortCatalogList"></param>
        /// <returns>Activity Summary Details</returns>
        public Ent.ResponseModel.Activity.Activity GetActivitySummaryDetails(int empId, int viewableEmployeeId, int actId, int rootActId, int callerId, int UserMode, string langCode, int shortCatalogList)
        {
            Logger.TraceFunctionEntry("GetActivitySummaryDetails", empId, viewableEmployeeId, actId, rootActId, callerId, UserMode, langCode, shortCatalogList);
            ResponseModel.Training.UserTrainingItem userTrainingItem = new UserTrainingItem();
            Ent.ResponseModel.Activity.Activity act = null;
           
            try
            {
                IStoredProcedure sp = DataConnection.CreateStoredProcedure("LMS_Activity.GetActivityGenDetails");
                sp.AddIntParameter("@i_EmpId", empId);
                sp.AddIntParameter("@i_ViewEmpId", viewableEmployeeId);
                sp.AddIntParameter("@i_ActivityId", actId);
                sp.AddIntParameter("@i_RootActId", rootActId);
                sp.AddIntParameter("@i_CallerId", callerId);
                sp.AddIntParameter("@i_UserMode", UserMode);
                sp.AddCharParameter("@vc_LangCode", langCode);
                sp.AddIntParameter("@ShortCatalogList", shortCatalogList);

                sp.AddReturnCursor("rs_ActNotes");
                sp.AddReturnCursor("rs_ActSchdDet");
                sp.AddReturnCursor("rs_ActFacilities");
                sp.AddReturnCursor("rs_ActInstructors");
                sp.AddReturnCursor("rs_ActGenDet");
                sp.AddReturnCursor("rs_ActAddInfo");

                sp.AddReturnCursor("rs_FulfilmentsSource");
                sp.AddReturnCursor("rs_FulfilmentsTarget");
                sp.AddReturnCursor("maxRec");
                sp.AddReturnCursor("nodeRec");
                sp.AddReturnCursor("rs_ActReq");
                sp.AddReturnCursor("rs_ActSkills");
                sp.AddReturnCursor("rs_ActCertifications");
                sp.AddReturnCursor("rs_ActPreq");
                sp.AddReturnCursor("rs_TRActConfg");
                sp.AddReturnCursor("recTrackCapacity");

                using (RecordSetReader rsr = sp.ExecuteReader())
                {
                    while (rsr.Read())
                    {
                        act = new ResponseModel.Activity.Activity()
                        {
                            Description = rsr.GetString(rsr.GetOrdinal("ActivityDesc")),
                            DescriptionHtml = rsr.GetString(rsr.GetOrdinal("ActivityDescFmt")),
                        };
                        act.Notes = new Notes()
                        {
                            UserNotesHtml = rsr.GetString(rsr.GetOrdinal("EmpNotesFmt")),
                            InstructorNotesHtml = rsr.GetString(rsr.GetOrdinal("InstrNotesFmt"))
                        };
                    }

                    rsr.NextResult();

                    while (rsr.Read())
                    {
                        act.Schedule = new ActivitySchedule()
                        {
                            StartDateUTC = rsr.GetFieldValue<DateTime?>("StartDt", null),
                            EndDateUTC = rsr.GetFieldValue<DateTime?>("EndDt", null),
                            EffectiveDateUTC = rsr.GetFieldValue<DateTime?>("EffectiveDt", null),
                            PublishDateUTC = rsr.GetFieldValue<DateTime?>("PublishDate", null),
                            ActivityTimeZone = rsr.GetFieldValue<int>(("ActTZ"), 0),
                            RegistrationDeadLineDateUTC = rsr.GetFieldValue<DateTime?>("RegDeadlineDt", null),
                            RegistrationCancellationDateUTC = rsr.GetFieldValue<DateTime?>("RegCnclDeadlineDt", null)
                        };

                        act.Cost = new Ent.ResponseModel.Activity.CostInformation()
                        {
                            Price = rsr.GetFieldValue<float?>("CostBase", null),
                            Currency = new Ent.ResponseModel.Common.Currency()
                            {
                                Id = rsr.GetFieldValue<int>("costcurrency", 0),
                            }
                        };
                        act.EstimatedDuration = (rsr.GetFieldValue("EstDur", 0) > 0) ? new Duration(rsr.GetFieldValue("EstDur", 0)) : null;
                        act.CBTLaunchMtdFK = rsr.GetFieldValue<int>("LaunchMtdFK", 0);
                        act.NoRegRequired = rsr.GetFieldValue("NoRegReqd", false);
                        act.GradingAndCompletionProperties = new ResponseModel.Activity.GradingAndCompletion()
                        {
                            EstimatedCreditHours = rsr.GetFieldValue<float?>("EstCrdHrs", null)
                        };
                        act.RegistrationConfiguration = new ResponseModel.Activity.RegistrationConfiguration()
                        {
                            OpenForRegistration = rsr.GetFieldValue("OpenForReg", false)
                        };
                    }
                    rsr.NextResult();
                    List<Location> locations = new List<Location>();

                    while (rsr.Read())
                    {
                        Location location = new Location();
                        location.Name = rsr.GetFieldValue<String>("Loc_Name", String.Empty);
                        location.URL = rsr.GetFieldValue<String>("Loc_Url", String.Empty);
                        location.Facility = new Facility()
                        {
                            Name = rsr.GetFieldValue("FacName", String.Empty),
                            City = rsr.GetFieldValue("FacCity", String.Empty),
                            State = rsr.GetFieldValue("FacState", String.Empty),
                            Country = rsr.GetFieldValue("FacCntry", String.Empty),
                            Directions = rsr.GetFieldValue("FacDirections", String.Empty),
                            URL = rsr.GetFieldValue("FacUrl", String.Empty),
                            Address1 = rsr.GetFieldValue("FacAddress1", String.Empty),
                            Address2 = rsr.GetFieldValue("FacAddress2", String.Empty),
                            PostalCode = rsr.GetFieldValue("FacZip", String.Empty)
                        };
                        locations.Add(location);
                    }

                    act.Locations = locations;
                    rsr.NextResult();
                    List<ResponseModel.User.User> userInstructors = new List<ResponseModel.User.User>();
                    while (rsr.Read())
                    {
                        ResponseModel.User.User instructor = new ResponseModel.User.User();
                        instructor.EmpFName = rsr.GetFieldValue<String>("Inst_FName", String.Empty);
                        instructor.EmpLName = rsr.GetFieldValue<String>("Inst_LName", String.Empty);
                        instructor.EmpMI = rsr.GetFieldValue<String>("Inst_MI", String.Empty);
                        instructor.EmployeeId = rsr.GetFieldValue<int>("EmpFK", 0);
                        userInstructors.Add(instructor);
                    }
                    act.Instructor = userInstructors;
                    rsr.NextResult();

                    while (rsr.Read())
                    {
                        act.IsActive = rsr.GetBoolean(rsr.GetOrdinal("Active"));
                        act.Name = rsr.GetString(rsr.GetOrdinal("ActivityName"));
                        act.Code = rsr.GetFieldValue<String>("Code", String.Empty);
                        act.ActivityLabel = new ActivityLabel()
                        {
                            Id = rsr.GetInt32(rsr.GetOrdinal("ActLabelFK")),
                            Name = rsr.GetString(rsr.GetOrdinal("ActLabelName"))
                        };
                        act.ImagePath = rsr.GetFieldValue<String>("ImagePath", String.Empty);
                        act.RootActivityId = rsr.GetFieldValue<int>("RootActID", 0);
                        act.Contact = rsr.GetFieldValue<String>("Contact", String.Empty);
                        act.URL = rsr.GetFieldValue<String>("URL", String.Empty);
                        act.WebBasedTrainingDetails = new WebBasedTraining()
                        {
                            ContentAccessConfiguration = new ContentAccessConfiguration()
                            {
                                Duration = rsr.GetFieldValue<int?>("Duration", null),
                                TriggerEvent = rsr.GetFieldValue("TriggerEvent", 1)
                            }
                        };
                       
                        act.IsRatingEnabled = rsr.GetBoolean(rsr.GetOrdinal("IsRatingEnabled"));
                        act.ActivityRating = new Rating()
                        {
                            AllowAnonymousUser = rsr.GetBoolean(rsr.GetOrdinal("AnonymousUser")),
                            AverageRating = rsr.GetDouble(rsr.GetOrdinal("AvgRating")),
                            CommentsCount = rsr.GetInt32(rsr.GetOrdinal("CommentsCount")),
                            IsCommentsAllowed = rsr.GetBoolean(rsr.GetOrdinal("IsCommentAllowed")),
                            RatingCount = rsr.GetInt32(rsr.GetOrdinal("RatingCount")),
                            ShowComments = rsr.GetBoolean(rsr.GetOrdinal("ShowComments"))
                        };
                        UserAttempt userAttempt = new UserAttempt();
                        userAttempt.AttendStatusId = rsr.GetFieldValue<int?>("AttemptStatus", null);
                        userTrainingItem.Attempt = userAttempt;
                        userTrainingItem.IsInstructor = Convert.ToBoolean(rsr.GetFieldValue<int>("ActInst", 0));
                        Community community = new Community()
                        {
                            EnabledFeatures = rsr.GetFieldValue<int>("CommunityEnabled", 0),
                            CommunityPK = rsr.GetFieldValue<int>("CommunityId", 0)
                        };
                        act.Community = community;
                    }
                    rsr.NextResult();

                    while (rsr.Read())
                    {
                        Ent.ResponseModel.Activity.MetaData metadata = new MetaData()
                       {
                           ContentTypeName = rsr.GetFieldValue<String>("ConType", String.Empty),
                           DeliveryMethodName = rsr.GetFieldValue<String>("DeliveryMethod", String.Empty),
                           LanguageName = rsr.GetFieldValue<String>("LanguageName", String.Empty),
                           RegionName = rsr.GetFieldValue<String>("RegionName", String.Empty),
                           MediaTypeName = rsr.GetFieldValue<String>("MedType", String.Empty)
                       };
                        act.MetaData = metadata;

                        act.IconFK = rsr.GetFieldValue<int>("IconFK", 0);
                        act.CBTPath = rsr.GetFieldValue<String>("CBTPath", String.Empty);
                        act.TaxConTypeID = rsr.GetFieldValue<int>("TaxConTypeId", 0);

                        act.TrainingOrganization = rsr.GetFieldValue<String>("TrainingOrg", String.Empty);
                    }
                    rsr.NextResult();
                    act.FulFillmentActivityName = new List<ResponseModel.Activity.Activity>();
                    while (rsr.Read())
                    {
                        Ent.ResponseModel.Activity.Activity FulFillmentActivity = new Ent.ResponseModel.Activity.Activity();
                        {
                            FulFillmentActivity.Name = rsr.GetFieldValue<String>("ActivityNameFulfillment", String.Empty);
                        };
                        act.FulFillmentActivityName.Add(FulFillmentActivity);
                    }
                    rsr.NextResult();
                    act.FulFilledActivityName = new List<ResponseModel.Activity.Activity>();
                    while (rsr.Read())
                    {
                        Ent.ResponseModel.Activity.Activity FulFilledActivity = new Ent.ResponseModel.Activity.Activity();
                        {
                            FulFilledActivity.Name = rsr.GetFieldValue<String>("ActivityNameFulfillment", String.Empty);
                        };
                        act.FulFilledActivityName.Add(FulFilledActivity);
                    }
                    rsr.NextResult();

                    while (rsr.Read())
                    {
                        act.Categories = new GenericResponseList<CategoryNode>()
                        {
                            MaxCount = rsr.GetInt32(rsr.GetOrdinal("RecordCount"))
                        };
                    }
                    rsr.NextResult();
                    while (rsr.Read())
                    {
                        CategoryNode objCategory = new CategoryNode()
                        {
                            CategoryNodeId = rsr.GetFieldValue("NodeId", 0),
                            CategoryNodePath = rsr.GetFieldValue("NodePath", string.Empty),
                            CanViewCategoryNode = rsr.GetFieldValue("CanViewNode", true),
                            CategoryNodeDescription = rsr.GetFieldValue("NodeDesc", string.Empty),
                            CategoryNodePathId = rsr.GetFieldValue("NodePathId", String.Empty)
                        };
                        act.Categories.Results.Add(objCategory);
                    }
                    rsr.NextResult();
                    act.ActivityAssignment = new List<ActivityAssignment>();
                    while (rsr.Read())
                    {
                        ActivityAssignment assignment=new ActivityAssignment()
                        {
                            ReasonType = rsr.GetFieldValue("ReasonType", 0),
                            ReasonName = rsr.GetFieldValue("ReasonName", string.Empty),
                            AssignmentNotes = rsr.GetFieldValue("AssignmentNotes", string.Empty)
                        };
                        act.ActivityAssignment.Add(assignment);
                       
                    }
                    rsr.NextResult();
                    act.ActivitySkills = new GenericResponseList<AssociatedObject<Skills>>();
                    while (rsr.Read())
                    {
                        Ent.ResponseModel.Activity.AssociatedObject<Skills> tempSkills = new AssociatedObject<Skills>()
                        {
                            Object = new Skills()
                            {
                                SkillName = rsr.GetFieldValue<String>("Skl_Name", null)
                            }
                        };

                        act.ActivitySkills.Results.Add(tempSkills);
                    }
                    rsr.NextResult();
                    while (rsr.Read())
                    {
                        act.IsCertification = rsr.GetFieldValue("IsCert", 0);
                    }
                    rsr.NextResult();
                    act.RegistrationConfiguration = new ResponseModel.Activity.RegistrationConfiguration()
                    {
                        Prerequisites = new GenericResponseList<ResponseModel.Activity.Prerequisite>()
                    };
                    while (rsr.Read())
                    {
                        ResponseModel.Activity.Prerequisite objPrerequisite = new ResponseModel.Activity.Prerequisite()
                        {
                            PrerequisiteAct = new ResponseModel.Activity.Activity()
                            {
                                Name = rsr.GetFieldValue("PreqName", String.Empty),
                            },

                            RequiresRegistrationOnly = rsr.GetFieldValue("ReqRegOnly", 0)
                        };

                        act.RegistrationConfiguration.Prerequisites.Results.Add(objPrerequisite);
                    }
                    rsr.NextResult();
                    
                    while (rsr.Read())
                    {
                        act.ActivityTR = new ResponseModel.Activity.ActivityTR()
                        {
                            PreReq = rsr.GetFieldValue("PreReq", string.Empty),
                            PublicConcern = rsr.GetFieldValue("PublicConcern", string.Empty),
                            Objectives = rsr.GetFieldValue("Objectives", string.Empty),
                            Methods = rsr.GetFieldValue("Methods", string.Empty)
                        };
                    }
                    while (rsr.Read())
                    {
                        act.AvailableSeats = rsr.GetFieldValue<int>("AvailableSeats", 0);

                        if (act.AvailableSeats.ToString() != "999999999")
                            act.UnlimitedCapacity = false;
                        else
                            act.UnlimitedCapacity = true;
                    }
                    userTrainingItem.TrainingActivity = act;
                }

                //TODO : To add code for multiple category checking TM session.
                if (act.Categories.Results != null)
                {
                    bool IsTalentManagementIntegrated = false;//context.DomainSettings(-1).GetSetting<bool>("Global", "TM", "IsTMIntegrationEnabled", false);

                    var strCategoryList = "";
                    int rootNodeId = GetActivitySummaryRootNodeId(empId, UserMode);
                    foreach (CategoryNode catNodes in act.Categories.Results)
                    {
                        if (catNodes.CategoryNodePath != "")
                        {
                            var strCategories = catNodes.CategoryNodePath.Split('>');
                            var strNodePathId = catNodes.CategoryNodePathId.Split(',');
                            var index1 = 0;
                            var len = strCategories.Length;
                            while (len-- >= 1)
                            {
                                //ViewBag.IsTMSession
                                if (IsTalentManagementIntegrated)
                                    strCategoryList = strCategoryList + strCategories[index1++] + "&gt;";
                                else
                                    strCategoryList = strCategoryList + "<a class=\"breadcrumb\" href='#' onclick='ActivitySummary_openRelatedCatalog(" + strNodePathId[index1] + "," + UserMode + "," + rootNodeId + ");return false;'>" + strCategories[index1++] + "</a>&gt;";
                            }
                            strCategoryList = strCategoryList.Substring(0, (strCategoryList.Length - 4)) + "</br>";
                        }
                    }
                    act.CategorySummaryDetails = strCategoryList;
                }
            }
            catch (Exception e)
            {
                Logger.Error("Unhandled Error in LMS_Activity.GetActivityGenDetails : ", e);
                throw e;
            }
            finally
            {
                Logger.TraceFunctionExit("GetActivitySummaryDetails");
            }
            return act;
        }

        /// <summary>
        /// To get root node for category of activity details
        /// </summary>
        /// <param name="empId">Employee Id</param>
        /// <param name="UserMode">User mode</param>
        /// <returns></returns>
        public int GetActivitySummaryRootNodeId(int empId, int UserMode)
        {
            Logger.TraceFunctionEntry("GetActivitySummaryRootNodeId", empId, UserMode);
            int rootNodeId = 0;
            try
            {
                IStoredProcedure sp = DataConnection.CreateStoredProcedure("Core_TAX.GetNodeAndStartNodeForUser");
                sp.AddIntParameter("@i_EmpId", empId);
                sp.AddIntParameter("@i_DomainId", 0);
                sp.AddIntParameter("@i_UserMode", UserMode);

                sp.AddReturnCursor("NodeIds");

                using (RecordSetReader rsr = sp.ExecuteReader())
                {
                    while (rsr.Read())
                    {
                        rootNodeId = rsr.GetFieldValue("Org_TaxNodeFK", 0);
                    }
                }
            }
            catch (Exception e)
            {
                Logger.Error("Unhandled Error in LMS_Activity.GetActivitySummaryRootNodeId : ", e);
                throw e;
            }
            finally
            {
                Logger.TraceFunctionExit("GetActivitySummaryRootNodeId");
            }
            return rootNodeId;
        }

        /// <summary>
        /// To check if there is a diploma associated with the activity
        /// </summary>
        /// <param name="iEmpId">Employee Id</param>
        /// <param name="iActivityId">Activity Id</param>
        /// <param name="iAttemptId">Attempt Id</param>
        /// <param name="strUserList">User list</param>
        /// <param name="iUserMode">User mode</param>
        /// <returns>true if diploma is available else false</returns>
        public bool GetActHasADiplomaAssociated(int iEmpId, int iActivityId, int iAttemptId, string strUserList, int iUserMode)
        {
            Logger.TraceFunctionEntry("GetActHasADiplomaAssociated", iEmpId, iActivityId, iAttemptId, strUserList, iUserMode);
            bool bIsDiplomaAssociated = false;
            try
            {
                IStoredProcedure sp = DataConnection.CreateStoredProcedure("LMS_Report.ActCompletionDiplomaCheck");
                sp.AddIntParameter("@i_EmpId", iEmpId);
                sp.AddIntParameter("@i_ActivityId", iActivityId);
                sp.AddIntParameter("@i_AttemptId", iAttemptId);
                sp.AddCharParameter("@vc_UserList", strUserList);
                sp.AddIntParameter("@i_UserMode", iUserMode);

                sp.AddReturnCursor("recDomParents");
                sp.AddReturnCursor("maxRec");

                using (RecordSetReader rsr = sp.ExecuteReader())
                {
                    int DiplomaPK = 0;
                    int RecCount = 0;
                    while (rsr.Read())
                    {
                        DiplomaPK = rsr.GetFieldValue("DiplomaPK", 0);
                    }
                    rsr.NextResult();
                    while (rsr.Read())
                    {
                        RecCount = rsr.GetFieldValue("MaxRecords", 0);
                    }

                    if (DiplomaPK == 0 || DiplomaPK == null || DiplomaPK.ToString() == "" || RecCount == 0)
                    {
                        bIsDiplomaAssociated = false;
                    }
                    else
                    {
                        bIsDiplomaAssociated = true;
                    }
                }
            }
            catch (Exception e)
            {
                Logger.Error("Unhandled Error in LMS_Activity.GetActHasADiplomaAssociated : ", e);
                throw e;
            }
            finally
            {
                Logger.TraceFunctionExit("GetActivitySummaryRootNodeId");
            }
            return bIsDiplomaAssociated; 
    }
}
}
